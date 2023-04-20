/**
 * @description test jwt token used in Chai HTTP requests in tests
 * @link https://jwt.io/
 */
const jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.aXzC7q7z1lX_hxk5P0R368xEU7H1xRwnBQQcLAmG0EY"

/**
 * 
header
{
  "alg": "HS256",
  "typ": "JWT"
}
payload
{
  "sub": "1234567890",
  "name": "John Doe"
}
secret=test
 */

export default jwt