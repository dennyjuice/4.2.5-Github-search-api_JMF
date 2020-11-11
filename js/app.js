(function () {
  // Global Vars
  const input = document.querySelector("#autocomplete");
  const autoBlock = document.querySelector("#repos-auto-block");
  const repoCards = document.querySelector("#repos");
  let repos = [];

  // Functions
  const debounce = (fn, debounceTime) => {
    let callFn;
    return function (...args) {
      clearTimeout(callFn);
      callFn = setTimeout(() => fn.apply(this, args), debounceTime);
    };
  };

  async function getFiveRepos(str) {
    const URL = "https://api.github.com/search/repositories";

    try {
      const response = await fetch(URL + `?q=${str}`);
      const repos = [];

      let result;

      if (response.ok) {
        result = await response.json();
      } else {
        throw new Error("Ошибка HTTP: " + response.status);
      }

      for (let i = 0; i < 5; i++) {
        if (!result.items[i]) {
          repos.push({ name: "Not found" });
          break;
        }
        const {
          id,
          name,
          owner: { login: owner },
          stargazers_count: stars,
        } = result.items[i];
        repos.push({ id, name, owner, stars });
      }

      return repos;
    } catch (e) {
      console.log(e);
    }
  }

  const getReposList = (repos) => {
    const list = [];

    for (let repo of repos) {
      const div = document.createElement("div");
      div.className = "repo-auto";
      div.dataset.repoId = repo.id;
      div.append(repo.name);
      list.push(div);
    }

    return list;
  };

  const getRepo = (repoId, repos) => {
    return repos.filter((el) => el.id === +repoId)[0];
  };

  const autoComplete = (show = true, repos = []) => {
    if (!show) return autoBlock.classList.add("hide");
    const repoNames = getReposList(repos);

    autoBlock.innerHTML = "";
    autoBlock.append(...repoNames);
    autoBlock.classList.remove("hide");
  };

  const addRepoCard = (repoId) => {
    const repo = getRepo(repoId, repos);
    repoCards.insertAdjacentHTML(
      "afterbegin",
      `
      <div class="repo">
            <div class="info">
                <p>Name: ${repo.name}</p>
                <p>Owner: ${repo.owner}</p>
                <p>Stars: ${repo.stars}</p>
            </div>
            <button class="button-primary delete"></button>
      </div>
    `
    );
  };

  // Listeners
  input.addEventListener(
    "keyup",
    debounce(async function () {
      let inputText = this.value;
      autoComplete(false);

      if (inputText.length > 1) {
        repos = await getFiveRepos(inputText);
        await autoComplete(true, repos);
      } else {
        autoComplete(false);
      }
    }, 200)
  );

  autoBlock.addEventListener("click", function (e) {
    const target = e.target;
    const repoId = target.dataset.repoId;
    addRepoCard(repoId);
  });

  repoCards.addEventListener("click", function (e) {
    const target = e.target;

    if (target.tagName === "BUTTON") {
      target.parentElement.remove();
    }
  });

  document.addEventListener("click", function (e) {
    const target = e.target;
    if (!target.closest("#repos-auto-block")) {
      autoComplete(false);
    }
  });

  input.addEventListener("click", function (e) {
    let inputText = this.value;
    console.log(repos);
    if (inputText.length > 1) {
      autoComplete(true, repos);
    }
    e.stopPropagation();
  });
})();
