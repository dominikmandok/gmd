/**
 * Saves a new cookie
 * @param cname Cookie-name
 * @param cvalue Cookie-value
 * @param exdays Time in days how long the cookie is valid. Default = 365
 */
export function setCookie(cname: string, cvalue: string, exdays: number = 365) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    const expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

/**
 * @param cname Cookie-name
 * @returns The cookie value
 */
export function getCookie(cname: string): string {
    const name = cname + "=";
    const cookieArray = document.cookie.split(';');
    let c: string = "";

    cookieArray.forEach((cookie) => {
        while (cookie.charAt(0) === ' ')
            cookie = cookie.substring(1);

        if (cookie.indexOf(name) === 0)
            c = cookie.substring(name.length, cookie.length);
    });
    
    return c;
}

/**
 * @param cname Cookie-name
 * @returns Does the cookie exist?
 */
export function cookieExists(cname: string): boolean {
    const val = getCookie(cname);
    return (val !== "");
}
