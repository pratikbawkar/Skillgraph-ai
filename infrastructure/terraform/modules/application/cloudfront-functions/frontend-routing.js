function handler(event) {
    var request = event.request;
    var uri = request.uri;

    // Keep the root route as-is.
    if (uri === "/") {
        return request;
    }

    // /roles/cloud-engineer/
    // -> /roles/cloud-engineer/index.html
    if (uri.endsWith("/")) {
        request.uri = uri + "index.html";
        return request;
    }

    // /roles/cloud-engineer
    // -> /roles/cloud-engineer/index.html
    //
    // /login
    // -> /login/index.html
    //
    // /admin/login
    // -> /admin/login/index.html
    if (!uri.includes(".")) {
        request.uri = uri + "/index.html";
    }

    return request;
}