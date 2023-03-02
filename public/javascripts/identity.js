let myIdentity = undefined;

async function loadIdentity(){
    let identity_div = document.getElementById("identity_div");

    try{
        let identityInfo = await fetchJSON(`api/${apiVersion}/users/myIdentity`)
        
        if(identityInfo.status == "loggedin"){
            myIdentity = identityInfo.userInfo.username;

            if (document.getElementById("signout") && document.getElementById("signin")) {
                document.getElementById("signout").classList.remove("hidden");
                document.getElementById("signin").classList.add("hidden");
            }
            
            if(document.getElementById("make_post_div")){
                document.getElementById("make_post_div").classList.remove("d-none");
            }
            Array.from(document.getElementsByClassName("new-comment-box")).forEach(e => e.classList.remove("d-none"))
            Array.from(document.getElementsByClassName("heart-button-span")).forEach(e => e.classList.remove("d-none"));
        } else { //logged out
            myIdentity = undefined;
            if(document.getElementById("make_post_div")){
                document.getElementById("make_post_div").classList.add("d-none");
            }
            Array.from(document.getElementsByClassName("new-comment-box")).forEach(e => e.classList.add("d-none"))
            Array.from(document.getElementsByClassName("heart-button-span")).forEach(e => e.classList.add("d-none"));
        }
    } catch(error){
        console.error(error)
        myIdentity = undefined;
        identity_div.innerHTML = `<div>
        <button onclick="loadIdentity()">retry</button>
        Error loading identity: <span id="identity_error_span"></span>
        </div>`;
        document.getElementById("identity_error_span").innerText = error;
        if(document.getElementById("make_post_div")){
            document.getElementById("make_post_div").classList.add("d-none");
        }
        Array.from(document.getElementsByClassName("new-comment-box")).forEach(e => e.classList.add("d-none"));
        Array.from(document.getElementsByClassName("heart-button-span")).forEach(e => e.classList.add("d-none"));
    }
}

async function logout() {
    try {
        let res = await fetch("/logout", {method: "POST"});
        await statusCheck(res);

        location.reload();
    } catch (err) {
        console.error(err);
    }
}

async function login(e) {
    let obj = new FormData(this);

    e.preventDefault();
    try {
        let res = await fetch("/login", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Object.fromEntries(obj))
        });

        await statusCheck(res);
        this.classList.add("hidden");
        document.getElementById("login-screen").classList.add("hidden");

        res = await res.text();
        res = res.substring(1, res.length-1);
        document.cookie = `userid=${res}`;

        await loadIdentity();
    } catch (err) {
        console.error(err);
    }
}

async function register(e) {
    e.preventDefault();
    let obj = new FormData(this);
    try {
        let res = await fetch("/register", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Object.fromEntries(obj))
        });

        await statusCheck(res);
        this.classList.add("hidden");
        document.getElementById("login-screen").classList.add("hidden")
    } catch (err) {
        console.error(err);
    }
}

function showLoginPage() {
    document.getElementById("login-screen").classList.remove("hidden");
    document.getElementById("login").classList.remove("hidden");
    document.getElementById("register").classList.add("hidden");
}

function showRegisterPage() {
    document.getElementById("login-screen").classList.remove("hidden");
    document.getElementById("register").classList.remove("hidden");
    document.getElementById("login").classList.add("hidden");
}

async function statusCheck(res) {
    if (!res.ok) {
        throw new Error(await res.text());
    }
    return res;
}