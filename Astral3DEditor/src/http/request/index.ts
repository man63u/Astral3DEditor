import {createRequest} from "./request";

export const request = createRequest({ baseURL:"/api",timeout:5 * 60 * 1000 });