import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CurrentUserService } from '../currentUser/current-user.service';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  constructor(private userService: CurrentUserService) {}
  getToken() {
    return this.userService.getAccessToken().then((token) => {
      let accessToken: any = JSON.parse(token);
      return accessToken.access_token;
    });
  }
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return from(this.handle(request, next)) as Observable<HttpEvent<any>>;
  }

  async handle(req: HttpRequest<any>, next: HttpHandler) {
    let authReq;
    if (req.url != environment.baseUrl + 'user/v1/systemUsers/login') {
      const token: any = await this.getToken();
      authReq = req.clone({
        setHeaders: {
          'X-auth-token': 'bearer ' + token,
        },
      });
      return next.handle(authReq).toPromise();
    } else {
      authReq = req.clone({});
    }
    return next.handle(authReq).toPromise();
  }
}
