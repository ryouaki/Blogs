import axios from 'axios';
import { Message, Notification, MessageBox } from 'element-ui';

/*
 * url 服务器 api地址
 * params 参数
 * opts {
 *   headers: 请求头设置
 *   success: 请求成功回调
 *   failed: 请求失败回调
 *   tips: 0,1,2,3 // 0 不做处理，1 notice成功，2，confirm对话框，3，对话框
 * }
 */

class Http {
  constructor(opts = {}) {
    const {
      timeout = 30000,
      baseUrl = '/api',
      contentType = 'application/json',
      withCredentials = true,
    } = opts;

    this.timeout = timeout;
    this.baseUrl = baseUrl;
    this.contentType = contentType;
    this.withCredentials = withCredentials;
  }

  get(url, params = {}, opts = {}) {
    return this.ajax('get', url, { params }, opts);
  }

  del(url, params = {}, opts = {}) {
    return this.ajax('delete', url, { params }, opts);
  }

  put(url, data = {}, opts = {}) {
    return this.ajax('put', url, { data }, opts);
  }

  post(url, data = {}, opts = {}) {
    return this.ajax('post', url, { data }, opts);
  }

  ajax(method, url, params, opts) {
    const ajaxRequest = axios({
      method,
      url: opts.baseUrl ? opts.baseUrl + url : this.baseUrl + url,
      headers: {
        'Content-Type': this.contentType,
        ...opts.headers,
      },
      timeout: opts.timeout ? opts.timeout : this.timeout,
      onUploadProgress: opts.uploading,
      onDownloadProgress: opts.download,
      withCredentials: opts.withCredentials !== undefined ? opts.withCredentials : this.withCredentials,
      ...params,
    });

    return ajaxRequest.then((res) => {
      const {
        data = {
          code: 10001,
          message: '服务器返回数据错误',
          data: null,
        },
      } = res || {};

      let ret = null;
      if (data.code === 0) {
        if (opts.success) {
          opts.success(data.data);
        }
        ret = data.data;
      } else {
        ret = Http.errorHandler(data, opts);
      }

      return ret;
    }).catch((err) => {
      const {
        data = {
          code: 10500,
          message: '服务器链接错误，请稍后再试！',
          data: null,
        },
      } = err.response || {};

      return Http.errorHandler(data, opts);
    });
  }

  static errorHandler(data, opts) {
    if (opts.failed && typeof opts.failed === 'function') {
      opts.failed(data);
    }
    // 0,不做默认提示处理，1，notice，2，alert，3，右侧提示
    switch (opts.tips) {
      case 1:
        Message({
          message: data.message,
          center: true,
          type: 'error',
        });
        break;
      case 2:
        MessageBox.alert(data.message, '提示', {
          type: 'error',
          confirmButtonText: '确定',
        });
        break;
      case 3:
        Notification({
          type: 'error',
          title: '出错啦',
          message: data.message,
        });
        break;
      default:
        break;
    }

    return data.data;
  }
}

export const http = new Http();

export default Http;
