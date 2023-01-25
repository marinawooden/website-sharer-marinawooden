
async function previewUrl(){
    let url = document.getElementById("urlInput").value;
    document.getElementById("url_previews").innerHTML = "";

    try {
        let preview = await fetch(`api/v1/urls/preview?url=${url}`);
        await statusCheck(preview);
        preview = await preview.text();

        displayPreviews(preview);
    } catch (err) {
        displayPreviews(err.message);
    }
}

async function statusCheck(res) {
    if (!res.ok) {
        throw new Error(await res.text());
    }
    return res;
}

function displayPreviews(previewHTML){
    document.getElementById("url_previews").innerHTML = previewHTML;
}
