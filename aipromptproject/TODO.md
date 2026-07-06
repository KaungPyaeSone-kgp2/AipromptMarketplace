# TODO - Fix API 502 for prompt/getAllprompts.php

- [ ] Gather more backend context (Database.php, BaseDAO.php, any routing/index/front controller that maps the endpoint)
- [ ] Identify likely 502 causes: path mismatch, PHP fatal error, missing class/require mismatch, route not reaching PHP file, CORS/preflight issues
- [ ] Implement fix in `backend/prompt/getAllprompts.php` (robust error handling + correct DAO class instantiation + return shape consistency)
- [ ] If needed, adjust `apiClient.js`/`promptService.js` for URL/path correctness
- [ ] Add logging (error_log) to capture the exact failure for 502
- [ ] Run/build or test the endpoint via a simple fetch/curl command
- [ ] Update Todo status after each step

