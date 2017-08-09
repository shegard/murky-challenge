function dd (id) {
    var holder = document.getElementById(id);
    holder.style.position = 'absolute';
    console.log(holder);
    var listener = function (event) {
        holder.style.left = holder.sx + event.x + 'px';
        holder.style.top = holder.sy + event.y + 'px';                    
    };
    holder.addEventListener('mousedown', function (e) {
        holder.sx = parseInt(getComputedStyle(holder).left, 10) - e.x; 
        holder.sy = parseInt(getComputedStyle(holder).top, 10) - e.y;
        holder.addEventListener('mousemove', listener);
    });
    holder.addEventListener('mouseup', function () {
        holder.removeEventListener('mousemove', listener);
    });
    holder.addEventListener('dblclick', function () {
        holder.style.left = '0px';
        holder.style.top = '0px';
    });
}

let r = new XMLHttpRequest(),
    credentials;


function set_status(st) {
    var st_cont = document.getElementById('status-container');
    //.children[0].innerHTML = st;
    if(st == 'init') {
        st_cont.style.boxShadow = '0 4px 10px 0 rgba(255, 152, 0, 0.2), \
                                    0 4px 20px 0 rgba(255, 152, 0, 0.19)';
        st_cont.children[0].innerHTML = 'pls, log in';
    } else if(st == 'no_login') {
        st_cont.style.boxShadow = '0 4px 10px 0 rgba(244, 67, 54, 0.2), \
                                    0 4px 20px 0 rgba(244, 67, 54, 0.19)';
        st_cont.children[0].innerHTML = 'no login';
    } else if(st == 'no_password') {
        st_cont.style.boxShadow = '0 4px 10px 0 rgba(244, 67, 54, 0.2), \
                                    0 4px 20px 0 rgba(244, 67, 54, 0.19)';
        st_cont.children[0].innerHTML = 'no password';
    } else if(st == 'bad_credentials') {
        st_cont.style.boxShadow = '0 4px 10px 0 rgba(244, 67, 54, 0.2), \
                                    0 4px 20px 0 rgba(244, 67, 54, 0.19)';
        st_cont.children[0].innerHTML = 'bad credentials';
    } else if(st == 'no_such_user') {
        st_cont.style.boxShadow = '0 4px 10px 0 rgba(255, 152, 0, 0.2), \
                                    0 4px 20px 0 rgba(255, 152, 0, 0.19)';
        st_cont.children[0].innerHTML = 'no such user';
    } else if(st == 'no_user') {
        st_cont.style.boxShadow = '0 4px 10px 0 rgba(255, 152, 0, 0.2), \
                                    0 4px 20px 0 rgba(255, 152, 0, 0.19)';
        st_cont.children[0].innerHTML = 'no user ';
    } else if(st == 'found') {
        st_cont.style.boxShadow = '0 4px 10px 0 rgba(76, 175, 80, 0.5), \
                                    0 4px 20px 0 rgba(76, 175, 80, 0.35)';
        st_cont.children[0].innerHTML = 'user found';
    } else if(st == 'good') {
        st_cont.style.boxShadow = '0 4px 10px 0 rgba(76, 175, 80, 0.5), \
                                    0 4px 20px 0 rgba(76, 175, 80, 0.35)';
        st_cont.children[0].innerHTML = 'ready to browse!';
    }
}

document.getElementById('form-container').children[0].onsubmit = function (ev) {
    ev.preventDefault();
    let login = document.getElementById('log').value,
        password = document.getElementById('psw').value;
    if(!login) {
        set_status('no_login');
    } else if(!password) {
        set_status('no_password');
    } else {
        check_credentials(login, password);
    }
}

document.getElementById('acc-changer').onclick = function (ev) {
    document.getElementById('search-button').disabled = true;
    document.getElementById('form-container').style.transform = 'rotateY(0deg)';
    document.getElementById('log').value = '';
    document.getElementById('psw').value = '';
    credentials = undefined;
    set_status('init');
}

function check_credentials(login, password) {
    let req = new XMLHttpRequest();
    req.open('POST', 'https://api.github.com/graphql');
    req.addEventListener('loadend', function () {
        //console.log(req.response);
        if(JSON.parse(req.response).data){
            credentials = btoa(login + ':' + password);
            set_status('good');
            document.getElementById('search-button').disabled = false;
            document.getElementById('form-container').style.transform = 'rotateY(180deg)';
            document.getElementById('loggined-as').innerHTML = `Logged in as: ${login}`;
        } else {
            set_status('bad_credentials');
        }

    });
    req.setRequestHeader('Content-Type', 'application/json');
    req.setRequestHeader('Accept', 'application/json');
    req.setRequestHeader('Authorization', `Basic ${btoa(login + ':' + password)}`);
    req.send(JSON.stringify({"query": "query { viewer { login } }"}));
}

function ld (e) {

    let resp = JSON.parse(this.response);
    //console.log(JSON.stringify(resp, null, 2));

    if(resp.data.user) {
        set_status('found');
        let holder = document.getElementById('item-container');
        let repositories = resp.data.user.repositories;

        for( let i = 0; i < repositories.nodes.length; i++ ) {          
            let repository = repositories.nodes[i];

            let item = document.createElement('div');
            item.classList.add('item');
            
            let repoHolder = document.createElement('div');
            repoHolder.classList.add('repohld');
            let tooltip = document.createElement('span');
            tooltip.classList.add('tooltipster');
            tooltip.innerHTML = repository.url;
            repoHolder.appendChild(tooltip);
            let repoContent = document.createElement('a');
            repoContent.innerHTML = repository.name;
            repoContent.href = repository.url;
            repoContent.target = '_blank';
            repoHolder.appendChild(repoContent);
            item.appendChild(repoHolder);
            
            let issues = repository.issues.nodes;
            let issHolder = document.createElement('div');
            issHolder.classList.add('isshld');          
            
            if (issues.length) {  
                for ( let j = 0; j < issues.length; j++ ) {
                    let issue = issues[j];
                    
                    let iss = document.createElement('div');
                    iss.classList.add('iss');          
                    let issContent = document.createElement('a');
                    issContent.innerHTML = issue.title;
                    issContent.href = issue.url;
                    issContent.target = '_blank';
                    iss.appendChild(issContent);
                    issHolder.appendChild(iss);
                }
            } else {
                let iss = document.createElement('div');
                iss.classList.add('iss');          
                let issContent = document.createElement('a');
                issContent.innerHTML = 'no issues :)';
                iss.appendChild(issContent);
                issHolder.appendChild(iss);
            }
            
            item.appendChild(issHolder);

            holder.appendChild(item);
            tooltip.style.left =  (parseInt(getComputedStyle(repoHolder).width, 10) - 
                                    parseInt(getComputedStyle(tooltip).width, 10)) / 2;
            
            addEvs();
            //li.addEventListener('click', () => alert (el.name));
        }
    } else {
        set_status('no_such_user');
    }
}

function action () {
    let gh_user = document.getElementById('github-user');
    if(gh_user.value) {
        gh_user.classList.toggle('wow');
        document.getElementById('search-button').style.display = 'none';
        let l = document.getElementById('item-container');
        let c = l.children;
        while (c.length) {
            l.removeChild(c[0]);
        }
        update(gh_user.value, 15);
    } else {
        set_status('no_user');
    }
}

document.getElementById('github-user').onfocus = function (event) {
    document.getElementById('github-user').classList.remove('wow');
    document.getElementById('search-button').style.display = 'inline-block';
}

function update (login, n) {
    r.open('POST', 'https://api.github.com/graphql');

    //r.addEventListener('progress', pr);
    r.addEventListener('loadend', ld);

    r.setRequestHeader('Content-Type', 'application/json');
    r.setRequestHeader('Accept', 'application/json');
    r.setRequestHeader('Authorization', `Basic ${credentials}`);

    r.send(JSON.stringify({ 
        "query":
        "query($login:String!, $nOfRepos:Int!) { \
            user(login: $login) { \
                login \
                repositories(first: $nOfRepos) { \
                    totalCount \
                    nodes { \
                        name \
                        url \
                        issues(first: $nOfRepos) { \
                            nodes { \
                                title \
                                url \
                            } \
                        } \
                    } \
                } \
            } \
        }", 
        "variables": {
            "login": login, 
            "nOfRepos": n
        } 
    }));
}

function addEvs () {
    let targets = document.getElementsByClassName('repohld');
    for ( let i = 0; i < targets.length; i++ ) {
        targets[i].onclick = function (ev) {
            if (ev.target.nodeName != 'A') {
                let dropdown = this.nextElementSibling;
                if(getComputedStyle(dropdown).height != '0px') {
                    dropdown.style.marginTop = '-1px';
                    dropdown.style.height = '0px';
                } else {
                    dropdown.style.marginTop = '0px';
                    dropdown.style.height = dropdown.scrollHeight + 'px';
                }
            }
        }
    }
}
