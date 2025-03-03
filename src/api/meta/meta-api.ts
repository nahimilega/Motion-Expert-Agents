import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { default as axiosRetry } from "axios-retry";

export interface ApiResponse<T> {
  data: T[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
  };
}

export interface PaginationResult<T> {
  items: T[];
  stats: {
    totalPages: number;
    successfulPages: number;
    failedPages: number;
  };
}

export class MetaApiClient {
  private readonly api: AxiosInstance;
  private readonly API_BASE_URL = "https://graph.facebook.com/v20.0";
  private readonly REQUEST_TIMEOUT = 30000;
  private readonly MAX_RETRIES = 3;

  constructor() {
    // Create Axios instance with base configuration
    this.api = axios.create({
      baseURL: this.API_BASE_URL,
      timeout: this.REQUEST_TIMEOUT,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    // Configure axios-retry
    axiosRetry(this.api, {
      retries: this.MAX_RETRIES,
      retryDelay: (retryCount) => {
        // Exponential backoff with jitter: 1s, 3s, 6s plus random jitter
        const delay = Math.pow(2, retryCount) * 500 + Math.random() * 500;
        console.log(`Retrying request (attempt ${retryCount + 1}/${this.MAX_RETRIES + 1}) after ${delay.toFixed(0)}ms delay`);
        return delay;
      },
      retryCondition: (error) => {
        // Retry on network errors and 5xx responses and rate limits
        return axiosRetry.isNetworkError(error) || axiosRetry.isRetryableError(error) || error.response?.status === 429;
      },
      onRetry: (retryCount, error, requestConfig) => {
        console.log(`Retry ${retryCount}/${this.MAX_RETRIES} for ${requestConfig.method} ${requestConfig.url}: ${error.message}`);
      },
    });

    // Add request and response interceptors for logging and timing
    this.setupInterceptors();
  }

  /**
   * Configure Axios interceptors for request/response logging
   */
  private setupInterceptors(): void {
    this.api.interceptors.request.use(
      (config) => {
        (config as any).startTime = new Date().getTime();
        return config;
      },
      (error) => {
        console.error("[REQUEST ERROR]", error);
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => {
        // For successful responses, calculate and log duration
        const startTime = (response.config as any).startTime;
        const duration = startTime ? new Date().getTime() - startTime : 0;

        console.log(`[RESPONSE] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`);
        return response;
      },
      (error) => {
        if (error.config) {
          const startTime = (error.config as any).startTime;
          const duration = startTime ? new Date().getTime() - startTime : 0;

          console.error(`[RESPONSE ERROR] ${error.response?.status || "Network Error"} ${error.config.method?.toUpperCase()} ${error.config.url} (${duration}ms)`, error.response?.data || error.message);
        } else {
          console.error("[RESPONSE ERROR] Request configuration not available", error.message);
        }

        return Promise.reject(error);
      }
    );
  }

  public async fetchData(endpoint: string, params: Record<string, any>): Promise<axios.AxiosResponse<ApiResponse<any>, any>> {
    try {
      return await this.api.get<ApiResponse<any>>(endpoint, { params: params });
    } catch (error) {
      this.handleError(`Error fetching data from ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * Make a paginated API request and return all data with pagination stats
   * @param endpoint API endpoint
   * @param params Request parameters
   * @returns Object containing items and pagination statistics
   */
  public async fetchPaginatedData<T>(endpoint: string, params: Record<string, any>): Promise<PaginationResult<T>> {
    const allItems: T[] = [];
    const stats = {
      totalPages: 0,
      successfulPages: 0,
      failedPages: 0,
    };

    try {
      let after: string | null = null;
      let hasMorePages = true;

      while (hasMorePages) {
        stats.totalPages++;
        console.log(`Fetching page ${stats.totalPages} from ${endpoint}${after ? " with cursor: " + after : ""}`);

        const pageParams = { ...params };
        if (after) {
          pageParams.after = after;
        }

        try {
          const response = await this.fetchData(endpoint, pageParams);
          const responseData = response.data;
          const items = responseData.data;

          if (!items || items.length === 0) {
            console.log(`Page ${stats.totalPages} returned no items, ending pagination.`);
            break;
          }

          console.log(`Received ${items.length} items from page ${stats.totalPages}`);

          allItems.push(...items);
          stats.successfulPages++;

          if (responseData.paging?.cursors?.after) {
            after = responseData.paging.cursors.after;
          } else {
            console.log("No more pages available.");
            hasMorePages = false;
          }
        } catch (error) {
          stats.failedPages++;
          this.handleError(`Failed to fetch page ${stats.totalPages}${after ? " with cursor: " + after : ""} after all retry attempts`, error);
          hasMorePages = false;
        }
      }

      return {
        items: allItems,
        stats,
      };
    } catch (error) {
      this.handleError(`Fatal error fetching paginated data from ${endpoint}`, error);
      return {
        items: allItems,
        stats,
      };
    }
  }

  protected handleError(message: string, error: unknown): void {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        console.error(`${message}: ${axiosError.response.status} - ${JSON.stringify(axiosError.response.data)}`);
      } else if (axiosError.request) {
        console.error(`${message}: No response received - ${axiosError.message}`);
      } else {
        console.error(`${message}: ${axiosError.message}`);
      }
    } else if (error instanceof Error) {
      console.error(`${message}: ${error.message}`);
      if (error.stack) {
        console.error(error.stack);
      }
    } else {
      console.error(`${message}: ${String(error)}`);
    }
  }
}
