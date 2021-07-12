const axios = require ("axios");
const fs = require ("fs");

async function gettypedata(){
    let res = await axios.get('https://animeowl.net/watch/boruto-naruto-next-generations/', {
    });
    fs.writeFile('./LinkGenerationData/Anime Owl Boruto, Naruto Next Generations.txt', JSON.stringify(res.data), (err) => {
        if (err) throw err;
    })

    let res1 = await axios.get('https://www.animefillerlist.com/shows/boruto-naruto-next-generations', {
    });
    fs.writeFile('Boruto, Naruto Next Generations.txt', JSON.stringify(res1.data), (err) => {
        if (err) throw err;
    })
}

async function testapi(){
    let response = await axios.get("https://omdbapi.com/?apikey=4c33291e&i=tt6342474&season=1");
    console.log(response.data.Episodes);
}


//gettypedata()
testapi();