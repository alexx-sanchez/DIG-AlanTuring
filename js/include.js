function includeHTML(id, url) {
    fetch(url)
        .then(res => res.text())
        .then(html => {
            document.getElementById(id).innerHTML = html;
        });
}

includeHTML("header", "includes/header.html");
includeHTML("footer", "includes/footer.html");
