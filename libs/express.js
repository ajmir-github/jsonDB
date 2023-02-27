export class Router {
  constructor(getAppMiddlewars) {
    this.getAppMiddlewars = getAppMiddlewars;
  }
  // Methods enum
  Methods = {
    get: "GET",
    post: "POST",
    patch: "PATCH",
    put: "PUT",
    delete: "DELETE",
  };
  // Request handlers
  _notFound = (req, res) => res.status(404).json({ message: "URL not found!" });
  _routerMiddlewares = [];
  _call = {
    get: [],
    post: [],
    patch: [],
    put: [],
    delete: [],
  };
  // call
  async callArrayFunc(funcs, req, res) {
    const appMiddlewars = this.getAppMiddlewars();
    const funcsWithMiddlewares = [
      ...appMiddlewars,
      ...this._routerMiddlewares,
      ...funcs,
    ];
    let breakOut = true;
    for (const func of funcsWithMiddlewares) {
      // break out of the loop if next is not called
      breakOut = true;
      // run the func
      const handleNext = () => {
        breakOut = false;
      };
      await func(req, res, handleNext);
      // Break
      if (breakOut) break;
    }
  }
  // main handle func
  async handle(req, res) {
    // Direct the request to thier handlers
    switch (req.method) {
      case this.Methods.get:
        return await this.callArrayFunc(this._call.get, req, res);
      case this.Methods.post:
        return await this.callArrayFunc(this._call.post, req, res);
      case this.Methods.patch:
        return await this.callArrayFunc(this._call.patch, req, res);
      case this.Methods.put:
        return await this.callArrayFunc(this._call.put, req, res);
      case this.Methods.delete:
        return await this.callArrayFunc(this._call.delete, req, res);
      // 404
      default:
        return await this._notFound(req, res);
    }
  }

  // router-level middlewars link CORS
  use(...funcs) {
    for (const func of funcs) this._routerMiddlewares.push(func);
  }
  // Functions setter
  get(...funcs) {
    this._call.get = funcs;
  }
  post(...funcs) {
    this._call.post = funcs;
  }
  patch(...funcs) {
    this._call.patch = funcs;
  }
  put(...funcs) {
    this._call.put = funcs;
  }
  delete(...funcs) {
    this._call.delete = funcs;
  }
}

export default class Express {
  _AppMiddlewares = [];
  use(...funcs) {
    for (const func of funcs) this._AppMiddlewares.push(func);
  }
  Router() {
    return new Router(() => this._AppMiddlewares);
  }
}
