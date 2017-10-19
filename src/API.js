// @flow
import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import serveFavicon from 'serve-favicon';
import globby from 'globby'

class API {
  express: Object;

  constructor () {
    this.express = express();
    this.middleware();
    this.routes();
  }

  middleware (): void {
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.express.use(
      serveFavicon(path.join(__dirname, '../public/favicon.ico'))
    );
  }

  site = (req: Request, res: Response, next: NextFunction): void => {
    res.sendFile('index.html', { root: path.join(__dirname, '../public') });
  };

  _use (Router: any): void {
    this.express.use('/api/v1', Router);
  }

  routes(): void {

    const opts = { cwd: path.join(__dirname, "routers") }

    // Connect all routerss
    globby.sync(['**/*Router.js'], opts).forEach(file => {
      const router = require("./routers/" + file);
      this._use(router.default);
    });

    // Front-end files
    this.express.use(express.static(path.join(__dirname, '../public')));
    this.express.get('*', this.site);
  }
}

export default API;