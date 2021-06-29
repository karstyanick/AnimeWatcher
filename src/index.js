import $ from "jquery";
import axios from "axios";
import "./style.css";

function colorselector(number){
    let color
    if(number < 6){
        color = "#FF0000"
    }
    else if(number >= 6 && number < 7){
        color = "#FF7F00"
    }
    else if(number >= 7 && number < 8){
        color = "#FFFF00"
    }
    else if(number >= 8 && number < 9){
        color = "#7FFF00"
    }
    else if(number >= 9){
        color = "#00FF00"
    }

    return color;
}

async function GetUserInput(){
    let showname = $("#showname").val();
    let episodes = $("#episodes").val();

    let startepisode = parseInt(episodes.split("-")[0]);
    let endepiosde = parseInt(episodes.split("-")[1]);
    let season = "1";
    if(parseInt(episodes.split("-")[2])){
        season = parseInt(episodes.split("-")[2]);
    }

    if(showname != null && startepisode != null && endepiosde != null){
        await getepisodedata(showname, startepisode, endepiosde, season)
    }
}

async function getiframesrc(url){

    if(url.includes("jujutsu-kaisen")){
        url = url.replace("jujutsu-kaisen", "jujutsu-kaisen-tv");
    }

    console.log(url)

    return await axios.get('https://cors-anywhere.herokuapp.com/' + url, {
    }).then(resp => {
        let regex = RegExp('data-source="https:\\/\\/vidstreaming\\.io\\/streaming\\.php\\?id=(.+?)"', "g");
        let matches = [...resp.data.matchAll(regex)];
        console.log("making get request for iframe");
        return "https://vidstreaming.io/streaming.php?id=" + matches[0][1];
    });
}

async function generateepisodetypedata(showname){
    /*return fetch(showname + ".txt")
        .then(response => response.text())
        .then(data => {
            let regex = RegExp('Number\\\\">\\d.+?\\\\"Type\\\\"><span>(?<type>.+?)<\\/span>', "g");
            let matches = [...data.matchAll(regex)];
            return matches
        });
     */

    if(showname === "kimetsu-no-yaiba"){
        showname = "demon-slayer-" + showname;
    }

    return await axios.get('https://cors-anywhere.herokuapp.com/https://animefillerlist.com/shows/' + showname, {
    }).then(resp => {
        let regex = RegExp('Number">\\d.+?"Type"><span>(?<type>.+?)<\\/span>', "g");
        let matches = [...resp.data.matchAll(regex)];
        console.log("making get request for types");
        return matches;
    });
}

function colorselectortype(type){

    let color;
    if(type === "Filler"){
        color = "#FF0000"
    }
    else if(type === "Mixed Canon/Filler"){
        color = "#FFFF00"
    }
    else if(type === "Anime Canon"){
        color = "#7FFF00"
    }
    else if(type === "Manga Canon"){
        color = "#4e4eff"
    }
    return color;
}

async function getepisodelink(showname){
    /*return fetch("./LinkGenerationData/Anime Owl " + showname + ".txt")
        .then(response => response.text())
        .then(data => {
            let regex = RegExp('episode-number\\\\" data-ep-id=\\\\"(\\d*)\\\\', "g");
            let matches = [...data.matchAll(regex)];
            return matches
        });
     */

    if(showname === "hunter-x-hunter"){
        showname = "hunter-x-hunter-2011";
    }

    return await axios.get('https://cors-anywhere.herokuapp.com/https://animeowl.net/watch/' + showname, {
    }).then(resp => {
        let regex = RegExp('episode-number\" data-ep-id=\"(\\d*)', "g");
        let matches = [...resp.data.matchAll(regex)];
        console.log("making get request for links");
        return matches;
    });
}


async function getepisodedata(showname, startepisde, endepisode, season){

    let linkshowname = showname.replaceAll(" ", "-").replaceAll(",", "");

    let linkmatches = await getepisodelink(linkshowname);

    if(showname.includes("dub")){
        linkshowname = linkshowname.replace("-dub", "")
        showname = showname.replace(" dub", "")
    }

    let typematches = await generateepisodetypedata(linkshowname);
    let currentepisode;
    let currentepisodetime;

    await axios.get('http://localhost:3000/' + showname.replaceAll(" ", "_"), {
    }).then(resp => {
        currentepisode = resp.data.episode;
        currentepisodetime = resp.data.time;
    });

    for(let i = startepisde; i<=endepisode; i++){
        let bookmark = "";
        let time = "";
        let queryshowname = "";

        if(showname == "Naruto Shippuuden"){
            queryshowname = "Naruto Shippuden"
        }
        else if(showname === "Steinsgate"){
            queryshowname = "Steins;Gate"
        }
        else{
            queryshowname = showname
        }

        let query = "t="+queryshowname+"&season="+season+"&episode=" + i;

        if(currentepisode === i.toString()){
            console.log("test")
            bookmark = "✔"
            time = currentepisodetime;
        }

        let response = await axios.get('http://www.omdbapi.com/?apikey=4c33291e&' + query);
        let showlink = "http://animeowl.net/" + linkshowname + "/?ep_id=" + linkmatches[i-1][1]
        let rating

        if(response.data.imdbRating){
            rating = response.data.imdbRating
        }
        else{
            rating = "N/A"
        }

        $('#episodelist').append("<tr id = '" + showname+ "'><td style='background-color:" + colorselectortype(typematches[i-1][1]) + "' class='episode' id ='" + i +"' ><button id = '" + showlink +"' style='background-color:" + colorselectortype(typematches[i-1][1]) + "' class ='w3-button watch'>" + "Episode " + i + "</button></td><td class = 'rating' style='background-color:" + colorselector(rating) + "' ><span>"  + rating + "</span></td><td class = 'imdb' style='background-color:#f2f2f2'><a target=\"_blank\" href='https://www.imdb.com/title/" + response.data.imdbID + "'>IMDB</a></td><td style = 'background-color:#f2f2f2'><button class = 'w3-button Bookmark'>Bookmark</button></td><td style = 'background-color: #f2f2f2'><input class = 'timeinput' style = 'outline:none; border:none; border-color:transparent; background-color: #f2f2f2; padding-left: 6px' id = 'time_"+i+"' placeholder='00:00' size='3' maxlength='5'></td><td style = 'background-color:#f2f2f2'><span>" + bookmark + "</span></td></tr>");
        $("#time_" + i).val(time);
    }
}

$("#submitsearch").click( async() =>{
    $("#episodelist").empty();
    $("#episodelist").append("<th>Episode</th><th>Rating</th><th>IMDB</th><th>Bookmark</th><th>Time</th><th>✔</th>");
    GetUserInput();
})

$("#episodelist").on('keyup', ".timeinput", function(e) {
    if (e.which && this.value.length === 2 && e.which !== 8) {
        this.value += ':';
    }
})

$('#episodelist').on("click", ".watch", async(e) => {
    let link = e.currentTarget.closest("button").id;
    console.log(link);
    let iframesrc = await getiframesrc(link);

    $('#episodeframe').attr("src", iframesrc);
})

$('#episodelist').on("click", ".Bookmark", async(e) =>{
    let episodeid = e.currentTarget.closest("tr").children[0].id;
    let showname = e.currentTarget.closest("tr").id;
    let time = $("#time_" + e.currentTarget.closest("tr").children[0].id).val();
    let currentbookmark = await axios.get('http://localhost:3000/' + showname.replaceAll(" ", "_"));

    $('#episodelist > tr').each(function(index, tr) {
        if(tr.children[0].id === currentbookmark.data.episode){
            tr.children[5].innerHTML = "";
            if(currentbookmark.data.episode != episodeid){
                $("#time_" + currentbookmark.data.episode).val("");
            }
        }
    });

    let episode = e.currentTarget.closest("tr").children[0].children[0].innerHTML.split(" ")[1];

    e.currentTarget.closest("tr").children[5].innerHTML = "✔";

    axios.post('http://localhost:3000/' + showname.replaceAll(" ", "_"), {
        episode: episode,
        time: time
    })
})

var per = 0;
$(document).ready(function(){
    $("#persoff").css("height", $(document).height()).hide();
    $(document).click(function(e) {
        if(!$(e.target).hasClass('switch') && per == 1) {
            $("#persoff").toggle();
            per = 0;
        }
    });
});

$(".switch").click(function(){
    $("#persoff").toggle();
    per += 1;
    if (per == 2) {
        per = 0;
    }
});









