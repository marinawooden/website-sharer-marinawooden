const FAVORITESINFO = {
    "website": "website of all time",
    "npm-package": "NPM Package",
    "database": "database"
}

async function init(){
    await loadIdentity();
    loadUserInfo();

    document.getElementById("userinfo").addEventListener("submit", saveUserInfo)
}

async function saveUserInfo(e){
    e.preventDefault();
    let params = new FormData(e.currentTarget)
   try {
    let res = await fetch(`/api/${apiVersion}/users/me/update`, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"favorites": Object.fromEntries(params)})
    });
    await statusCheck(res);

    location.reload();

   } catch (err) {
    console.error(err);
   }
}

async function statusCheck(res) {
    if (!res.ok) {
        throw new Error(res);
    }

    return res;
}
async function loadUserInfo(){
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('user');
    if(username==myIdentity){
        document.getElementById("username-span").innerText= `You (${username})`;
        document.getElementById("user_info_new_div").classList.remove("d-none");
        
    }else{
        document.getElementById("username-span").innerText=username;
        document.getElementById("user_info_new_div").classList.add("d-none");
    }
    
    //TODO: do an ajax call to load whatever info you want about the user from the user table
    try {
        let res = await fetch(`/api/${apiVersion}/users/${username}/info`);
        await statusCheck(res);

        res = await res.json();
        displayInfo(res);
    } catch (err) {
        console.error(err);
    }


    loadUserInfoPosts(username)
}

function displayInfo(res) {
    let toDisplayIn = document.getElementById("user_info_div");
    toDisplayIn.innerHTML = "";

    Object.keys(FAVORITESINFO).forEach((elem) => {
        let span = document.createElement("strong");
        let sentence = document.createElement("p");

        let favorite = res[elem] ? res[elem] : "I don't know!";

        span.textContent = `Favorite ${FAVORITESINFO[elem]}? `;
        sentence.textContent = favorite;

        sentence.prepend(span);
        toDisplayIn.appendChild(sentence);
    });
}


async function loadUserInfoPosts(username){
    document.getElementById("posts_box").innerText = "Loading...";
    let postsJson = await fetchJSON(`api/${apiVersion}/posts?username=${encodeURIComponent(username)}`);
    let postsHtml = postsJson.map(postInfo => {
        return `
        <div class="post">
            ${escapeHTML(postInfo.description)}
            ${postInfo.htmlPreview}
            <div><a href="/userInfo.html?user=${encodeURIComponent(postInfo.username)}">${escapeHTML(postInfo.username)}</a>, ${escapeHTML(postInfo.created_date)}</div>
            <div class="post-interactions">
                <div>
                    <span title="${postInfo.likes? escapeHTML(postInfo.likes.join(", ")) : ""}"> ${postInfo.likes ? `${postInfo.likes.length}` : 0} likes </span> &nbsp; &nbsp; 
                </div>
                <br>
                <div><button onclick='deletePost("${postInfo.id}")' class="${postInfo.username==myIdentity ? "": "d-none"}">Delete</button></div>
            </div>
        </div>`
    }).join("\n");
    document.getElementById("posts_box").innerHTML = postsHtml;
}


async function deletePost(postID){
    let responseJson = await fetchJSON(`api/${apiVersion}/posts`, {
        method: "DELETE",
        body: {postID: postID}
    })
    loadUserInfo();
}