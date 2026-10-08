# Errors

`RentCarSoftError` is the only error type thrown by the bridge.

| Code | When |
| --- | --- |
| `config` | `RCS_URL` or `RCS_KEY` is missing or blank. No request is sent. |
| `unauthorized` | HTTP 401. |
| `invalid_request` | HTTP 400. |
| `not_found` | HTTP 404, including an empty 404 body. |
| `api` | HTTP 5xx, other non-OK statuses, or an offer walk that passes 20 full pages. |
| `timeout` | The abort signal fires (`TimeoutError` or `AbortError`). |
| `network` | `fetch` throws for any other reason. |
| `malformed_response` | Empty 200 body, non-JSON body, a JWT-shaped body, or a JSON value that is not the shape the parser accepts. |

The public message comes from a fixed table in `errors.ts`. One list-walk failure uses the additional sentence `RentCarSoft offer list exceeded the page limit.`

The original `fetch` error is not attached. Response bodies are not attached. That keeps API keys, reset tokens, and customer payloads out of logs if a caller logs `error.message`.

HTTP 204 and 205 return `undefined`. Password recovery start and completion use that.

A reservation response without a boolean `success` is `malformed_response`. It is not reported as a failed booking with `success: false`.

A promo body whose `success` is neither boolean nor the strings `true` and `false` is `malformed_response`.

Client payloads that are empty, a non-object, or an array whose length is not 1 are `malformed_response`.

There is no retry.
