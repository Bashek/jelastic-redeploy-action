const core = require('@actions/core');

const REDEPLOY_URL = "https://app.mircloud.host/1.0/environment/control/rest/redeploycontainers";
const SIGNOUT_URL = "https://app.mircloud.host/1.0/users/authentication/rest/signout";
const SIGNIN_URL = "https://app.mircloud.host/1.0/users/authentication/rest/signin";
const SYSTEM_APPID = "1dd8d191d38fff45e62564fcf67fdcd6";

const makeRequest = async (actionName, url, params) => {
    console.log(`Start ${actionName}`);

    const body = Object.keys(params)
        .reduce((bodyString, key) => {
            return bodyString + `${key}=${encodeURI(params[key])}&`
        }, "");

    return fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        },
        body
    }).then((response) => response.json())
        .then((result => {
            console.log(JSON.stringify(result, null, "  "));

            if (result.status !== 0) {
                throw Error(`actionName field. Status code = ${result.status}`);
            }

            return result;
        }));
}

try {
    const login = core.getInput('login');
    const password = core.getInput('password');
    const envName = core.getInput('env-name');
    const tag = core.getInput('tag');
    const nodeId = core.getInput('node-id');

    const { session } = await makeRequest(SIGNIN_URL, {
        appid: SYSTEM_APPID,
        password: password,
        login
    });

    await makeRequest(REDEPLOY_URL, {
        session,
        envName,
        tag,
        nodeId
    });

    await makeRequest(SIGNOUT_URL, {
        appid: SYSTEM_APPID,
        session
    });

} catch (error) {
    core.setFailed(error.message);
}
