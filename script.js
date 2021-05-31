const searchInput = document.getElementById('searchinput');
const submit = document.getElementById('submit');

searchInput.addEventListener('keyup', e => {
    let inputValue = e.target.value;
    let val = inputValue.trim();
  
    if (val && !/\s/g.test(val)) {
      submit.disabled = false;
    } else {
      submit.disabled = true;
    }
})

const description = document.getElementById('description');
const repocount = document.getElementById('repo-count');
const repositoryNos = document.getElementById('repo-no');
const innerRepositoryNo = document.getElementById('inner-repo-no');


const avatar = document.getElementById('avatar');
const avatar2 = document.getElementById('avatar2');
const avatartext = document.getElementById('avatar-text');
const tabsimg = document.getElementById('tabs-img');
const tabsname = document.getElementById('tabs-name');
const tabsprofile = document.getElementById('follow-user');

const toggle = document.getElementById('toggle');
const fullName = document.getElementById('name');
const form = document.getElementById('form');
const error = document.getElementById('error');
const avatarimg = document.getElementById('avatar-image');



form.addEventListener('submit', e => {
  e.preventDefault();
//   form.classList.toggle('loading');
  error.classList.remove('display');

  const user = searchInput.value.trim();
  
  getUserRepos(user);
})

const user = document.getElementById('username');
  
const getUserRepos = async (username) => {
    // GET TOKEN
    const tokenUrl = 'https://mocki.io/v1/e0becf7a-e841-42c2-84cc-f6b2ea4063f7';
    const tokenResponse = await fetch(tokenUrl);
    if (!tokenResponse.ok) {
    form.classList.toggle('loading');
    error.innerText = 'Invalid Token';
    error.classList.add('display');
    return;
    }

    const tokenData = await tokenResponse.json();
    const token = tokenData.token;

    const url = 'https://api.github.com/graphql';

    const reqBody = JSON.stringify({
        query: `{
            viewer {
                login
                avatarUrl
            }
            user(login: "${username}") {
            name
            login
            bio
            avatarUrl
            repositories(first: 20 orderBy: {field:PUSHED_AT, direction: DESC}) {
                totalCount
                nodes {
                name
                stargazerCount
                pushedAt
                forkCount
                isFork
                parent {
                    forkCount
                }
                description
                languages(first: 1) {
                    nodes {
                    name
                    }
                }
                
                }
            }
            }
        }`
    });

    const options = {
        method: 'post',
        body: reqBody,
        headers: {
        'Content-Type': 'application/json',
        'Content-Length': reqBody.length,
        Authorization: 'Bearer ' + token,
        },
    }

    const response = await fetch(url, options);
    const data = await response.json();

    form.classList.toggle('loading');

    if (!response.ok) {
    error.innerText = data.message;
    error.classList.add('display');
    return;
    }

    if (data.hasOwnProperty('errors')) {
        error.innerText = 'Invalid! User not found';
        error.classList.add('display');
        return;
    }

    form.style.display = 'none';

    const user = data.data.user;
    const viewer = data.data.viewer;

    fullName.innerText = user.name;
    user.innerText = user.login;
    tabsname.innerText = user.login;
    description.innerText = user.bio;
    avatar.src = user.avatarUrl;
    tabsimg.src = user.avatarUrl;
    avatar2.src = viewer.avatarUrl;
    avatarimg.src = viewer.avatarUrl;
    avatartext.innerText = viewer.login;

    const totalCount = user.repositories.totalCount;

    repocount.innerHTML = `
    <span>${totalCount}</span> ${totalCount > 1 ? 'results' : 'result'} for <span>public</span> repositories`;

    document.getElementById('userrepo').innerHTML = '';
    repositoryNos.innerText = totalCount;
    innerRepositoryNo.innerText = totalCount;
    const repositories = user.repositories.nodes;

    repositories.forEach(repos => {

        const forks = repos.isFork ? repos.parent.forkCount : repos.forkCount;
        const lastupdated = lastUpdated(repos.pushedAt);
        const lang = repos.languages.nodes.length
                    ? repos.languages.nodes[0].name : '';

        const repo = formatting(repos.name, repos.stargazerCount, forks, repos.description, lastupdated, lang);

        document.getElementById('userrepo').innerHTML += repo;
    });
}  

function lastUpdated(date) {
    const lastUpdatedDate = new Date(date);
    const currDate = new Date();
   
    const timeDiff = currDate.getTime() - lastUpdatedDate.getTime();   
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    
    const days = Math.floor(daysDiff);
    const hours = Math.floor((daysDiff % 1) * 24) + 1;

    if (days > 30) {
        return `Updated on ${lastUpdatedDate.getDate()} ${lastUpdatedDate.toLocaleString('default', { month: 'short' })} ${lastUpdatedDate.getFullYear()}`
    }

    if (days > 1) {
        return `Updated ${days} days ago`;
    }

    if (days === 1) {
        return `Updated a day ago`;
    }

    return `Updated ${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
}


function formatting(repoName, starCount, forkCount, repoDesc, updated, language) {

    let lang = '';
    let repoFork = '';

    if(language) {
       lang =  `<span class="repo-color repo-${language.toLowerCase()}"></span><small>${language}</small>`
    }
    else {
        lang = '';
    } 
    
    if(forkCount) {
        repoFork = `<svg aria-label="fork" role="img" viewBox="0 0 16 16" version="1.1" data-view-component="true" height="16" width="16" class="svg">
        <path fill-rule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"></path>
    </svg> <small>${forks}</small>`
    }
    else {
        repoFork = '';
    }

    let stars = '';

    if(starCount) {
        stars = `<img src="assets/star.svg" alt="star"><small>${stars}</small>`;
    }
    else {
        stars = '';
    }

    let repodesc = (repoDesc) ? repoDesc : '';
        
    return `
    <div class="repo">
                    <div class="repo-info">
                        <h3 class="repo-name">${repoName}</h3>
                        <span class="repo-description">${repodesc}</span>
                        <div class="repo-detail">
                        ${lang}${stars}${repoFork}
                            <small>${updated}</small>
                        </div>
                    </div>
                    <button class="repo-star">
                        <img src="assets/star.svg" alt="star">
                        Star
                    </button>
                </div>
    `
}

window.addEventListener('scroll', () => {
    const windowY = window.scrollY;
    const userY = user.offsetTop;

    const followUser = document.getElementById('follow-user');
  
    if (windowY > userY) {
      followUser.classList.add('visible');
    } else {
      followUser.classList.remove('visible');
    }
});

