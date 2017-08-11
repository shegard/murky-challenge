let graphqlRequest = new XMLHttpRequest(),
    user_credentials;

    
// this function simply changes "status" string in #status-container element
function set_status(st) {
    var st_cont = document.getElementById('status-container');
    if(st == 'init') {
        st_cont.style.boxShadow = '0 4px 10px 0 rgba(255, 152, 0, 0.5), \
                                    0 4px 20px 0 rgba(255, 152, 0, 0.35)';
        st_cont.children[0].innerHTML = 'pls, log in';
    } else if(st == 'no_login') {
        st_cont.style.boxShadow = '0 4px 10px 0 rgba(244, 67, 54, 0.5), \
                                    0 4px 20px 0 rgba(244, 67, 54, 0.35)';
        st_cont.children[0].innerHTML = 'no login';
    } else if(st == 'no_password') {
        st_cont.style.boxShadow = '0 4px 10px 0 rgba(244, 67, 54, 0.5), \
                                    0 4px 20px 0 rgba(244, 67, 54, 0.35)';
        st_cont.children[0].innerHTML = 'no password';
    } else if(st == 'bad_credentials') {
        st_cont.style.boxShadow = '0 4px 10px 0 rgba(244, 67, 54, 0.5), \
                                    0 4px 20px 0 rgba(244, 67, 54, 0.35)';
        st_cont.children[0].innerHTML = 'bad credentials';
    } else if(st == 'no_such_user') {
        st_cont.style.boxShadow = '0 4px 10px 0 rgba(255, 152, 0, 0.5), \
                                    0 4px 20px 0 rgba(255, 152, 0, 0.35)';
        st_cont.children[0].innerHTML = 'no such user';
    } else if(st == 'no_user') {
        st_cont.style.boxShadow = '0 4px 10px 0 rgba(255, 152, 0, 0.5), \
                                    0 4px 20px 0 rgba(255, 152, 0, 0.35)';
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

// this function sends request to github API and validates user's credentials
function check_user_credentials(login, password) {
    let req = new XMLHttpRequest();
    req.open('POST', 'https://api.github.com/graphql');
    req.addEventListener('loadend', function () {
        //console.log(req.response);
        if(JSON.parse(req.response).data){
            user_credentials = btoa(login + ':' + password);
            set_status('good');
            document.getElementById('search-button').disabled = false;
            document.getElementById('form-container').style.transform = 'rotateY(180deg)';
            document.getElementById('loggined-as').innerHTML = `Logged in as: \
                <span id="loggined">${login}</span>`;
            document.getElementById('database-viewer').innerHTML = `view your \
                database <a href="/${login}_actions.db" target="_blank" \
                id="database-link">here</a>`;
        } else {
            set_status('bad_credentials');
        }

    });
    req.setRequestHeader('Content-Type', 'application/json');
    req.setRequestHeader('Accept', 'application/json');
    req.setRequestHeader('Authorization', `Basic ${btoa(login + ':' + password)}`);
    req.send(JSON.stringify({"query": "query { viewer { login } }"}));
}

// here we attached custom "submit" event to #form-container
document.getElementById('form-container').children[0].onsubmit = function (ev) {
    ev.preventDefault();
    let login = document.getElementById('log').value,
        password = document.getElementById('psw').value;
    if (!login && !password) {
        login = document.getElementById('log').placeholder;
        password = document.getElementById('psw').placeholder;
    }
    if(!login) {
        set_status('no_login');
    } else if(!password) {
        set_status('no_password');
    } else {
        check_user_credentials(login, password);
    }
}

// this function sends request to github API and gets information about 
// user's repositories and issues
function graphql_query (login, n) {
    graphqlRequest.open('POST', 'https://api.github.com/graphql');

    graphqlRequest.addEventListener('loadend', add_content);

    graphqlRequest.setRequestHeader('Content-Type', 'application/json');
    graphqlRequest.setRequestHeader('Accept', 'application/json');
    graphqlRequest.setRequestHeader('Authorization', `Basic ${user_credentials}`);

    graphqlRequest.send(JSON.stringify({ 
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

// this function sends the request to server to insert user's search action
// into user's_action table in database
function postgresql_query(target) {
    let req = new XMLHttpRequest();
    req.open('POST', '/abc.test');
    req.setRequestHeader('Content-Type', 'application/json');
    req.setRequestHeader('Accept', 'application/json');
    req.addEventListener('loadend', function () {
        console.log(this.response);
    });
    req.send(JSON.stringify({
        'login': document.getElementById('loggined').innerText,
        'target': target,
        'time': (new Date()).toLocaleTimeString()
    }));
}

// this function empties previous github API request result and initiate new one,
// also pushes user's search requests to database
function action() {
    let gh_user = document.getElementById('github-user');
    if (gh_user.value) {
        postgresql_query(gh_user.value);
        gh_user.classList.toggle('wow');
        document.getElementById('search-button').style.display = 'none';
        let l = document.getElementById('item-container');
        let c = l.children;
        while (c.length) {
            l.removeChild(c[0]);
        }
        graphql_query(gh_user.value, 15);
    } else {
        set_status('no_user');
    }
}

// resets user's log in 
document.getElementById('acc-changer').onclick = function (ev) {
    document.getElementById('search-button').disabled = true;
    document.getElementById('form-container').style.transform = 'rotateY(0deg)';
    document.getElementById('log').value = '';
    document.getElementById('psw').value = '';
    user_credentials = undefined;
    set_status('init');
}

// this function  github API request and add content to #item-container
// by the following schema
// add row ('div' with class .item)
//   add subrow for repository ('div' with class .repohld)
//     add tooltip to repository ('span' with class .tooltipster)
//     add href for repository name ('a')
//   add subrow for issues ('div' with class .isshld)
//     add (n) issue(s) ('div' with class .iss)
//       add href to issue ('a')
function add_content (e) {

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
        }
    } else {
        set_status('no_such_user');
    }
}

// just prettifies user request
document.getElementById('github-user').onfocus = function (event) {
    document.getElementById('github-user').classList.remove('wow');
    document.getElementById('search-button').style.display = 'inline-block';
}

// adds sliding effect to issues container #isshld
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
