import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Bear } from '../reducers/index';

@Injectable()
export class BearService {

  private static BEAR_BACKEND_URL = "http://localhost:3000/bears"
  private static BEAR_HEADERS = { "Content-Type": "application/json" }

  constructor(private http: HttpClient) {

  }

  postBear(bear: Bear) {
    return this.http.post(BearService.BEAR_BACKEND_URL,
      this.getBearBody(bear), { headers: BearService.BEAR_HEADERS })
  }

  deleteBear(bear: Bear) {
    return this.http.request("DELETE", BearService.BEAR_BACKEND_URL,
      { headers: BearService.BEAR_HEADERS, body: this.getBearBody(bear) })
  }

  getBearBody(bear: Bear) {
    return JSON.stringify({ bear })
  }

}
