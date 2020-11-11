const debounce = (fn, debounceTime) => {
  let callFn;
  return function (...args) {
    //debugger;
    clearTimeout(callFn);
    callFn = setTimeout(() => fn.apply(this, args), debounceTime);
  };
};

async function getFiveRepos(str) {
  const URL = "https://api.github.com/search/repositories";

  try {
    const response = await fetch(URL + `?q=${str}`);

    if (response.ok) {
      const result = await response.json();
      const repos = [];

      for (let i = 0; i < 5; i++) {
        const {
          name,
          owner: { login: owner },
          stargazers_count: stars,
        } = result.items[i];
        repos.push({ name, owner, stars });
      }

      return repos;
    } else {
      throw new Error("Ошибка HTTP: " + response.status);
    }
  } catch (e) {
    console.error(e);
  }
}

let testArr = [];

const getReposFragment = (repos) => {
  const result = [];

  for (let repo of repos) {
    const div = document.createElement("div");
    div.className = "repo-auto";
    div.append(repo.name);
    result.push(div);
  }

  return result;
};

const autoComplete = (show = true, repos = []) => {
  console.log(repos);
  const autoBlock = document.querySelector(".repos-auto-block");
  const repoNames = getReposFragment(repos);
  autoBlock.innerHTML = "";
  autoBlock.append(...repoNames);
  autoBlock.classList.remove("hide");
  if (!show) autoBlock.classList.add("hide");
};

const input = document.querySelector("#autocomplete");

input.addEventListener(
  "keyup",
  debounce(async function (e) {
    let inputText = this.value;

    if (inputText.length > 1) {
      //debugger;
      const repos = await getFiveRepos(inputText);
      await autoComplete(true, repos);
    }
  }, 200)
);
