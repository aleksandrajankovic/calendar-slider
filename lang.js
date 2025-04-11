document.addEventListener("DOMContentLoaded", function () {
    var langDropdown = document.querySelector(".lang-dropdown");
    var langLink = document.getElementById("lang-link");
    var flagImg = document.getElementById("flag-img");
  
    function redirectToLanguage(selectedLang) {
        let pathArray = document.URL.split("/");
        let secondLevelLocation = pathArray[4] || ""; 
        

        if (selectedLang === "sw") {
          window.location.href = `./${secondLevelLocation}`;
        } else if (selectedLang === "en") {
          window.location.href = `./en/${secondLevelLocation}`;
        } else {
          console.warn(`Nepoznat jezik: ${selectedLang}`);
        }
      }
  

    function setLanguageFromLocalStorage() {
      var selectedLang = localStorage.getItem("selectedLang");
      if (!selectedLang) return; 
  
      var selectedOption = langDropdown.querySelector(`[data-lang="${selectedLang}"]`);
      if (!selectedOption) {
        console.warn(`Nije pronađen jezik za: ${selectedLang}`);
        return;
      }
  
      var selectedImage = selectedOption.getAttribute("data-image");
      flagImg.setAttribute("src", selectedImage);
    }
  
   
    if (langDropdown && localStorage.getItem("selectedLang")) {
      setLanguageFromLocalStorage();
    }
  

    langLink.addEventListener("click", function (event) {
      event.preventDefault();
      langDropdown.style.display =
        langDropdown.style.display === "block" ? "none" : "block";
    });
  
   
    var langOptions = langDropdown.querySelectorAll("a[data-lang]");
    langOptions.forEach(function (option) {
      option.addEventListener("click", function (event) {
        event.preventDefault();
        var selectedLang = this.getAttribute("data-lang");
        var selectedImage = this.getAttribute("data-image");
  
    
        flagImg.setAttribute("src", selectedImage);
        redirectToLanguage(selectedLang);
  
       
        localStorage.setItem("selectedLang", selectedLang);
  
 
        langDropdown.style.display = "none";
      });
    });
  });
  