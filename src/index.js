//import $ from "jquery";
import axios from "axios";
import "./style.css";

let availableshows = [];

async function updateavailability(){

    availableshows.length = 0;

    axios.get('http://localhost:3000/shows/', {
    }).then(resp => {
        for(let i = 0; i<resp.data.length; i++){
            availableshows.push(resp.data[i].id)
        }
        console.log("Available shows: "+availableshows);
    });
}

updateavailability();

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

    let animeowl;
    let animefillerlist;
    let imdbid;
    let season;

    await axios.get('http://localhost:3000/shows/' + showname, {
    }).then(resp => {
        animeowl = resp.data.animeowl;
        animefillerlist = resp.data.animefillerlist;
        imdbid = resp.data.imdbid;
        season = resp.data.season;
    });

    if(animeowl != null && animefillerlist != null && imdbid != null){
        await getepisodedata(showname, animeowl, animefillerlist, imdbid, startepisode, endepiosde, season)
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
    return await axios.get('https://cors-anywhere.herokuapp.com/https://animeowl.net/watch/' + showname, {
    }).then(resp => {
        let regex = RegExp('episode-number\" data-ep-id=\"(\\d*)', "g");
        let matches = [...resp.data.matchAll(regex)];
        console.log("making get request for links");
        return matches;
    });
}

async function seasonepisodetoglobalepisode(imdbid, season){
    let nofepisodes = 0;

    for(let i = 1; i < parseInt(season); i++){
        let response = await axios.get('http://www.omdbapi.com/?apikey=4c33291e&i=' + imdbid + "&season=" + i)
        nofepisodes += response.data.Episodes.length;
    }

    if(imdbid == "tt5626028" && season >= 3){
        nofepisodes -= 1;
    }

    return nofepisodes;
}


async function getepisodedata(showname, animeowl, animefillerlist, imdbid, startepisde, endepisode, season){

    let linkmatches = await getepisodelink(animeowl);

    let typematches = await generateepisodetypedata(animefillerlist);
    let currentepisode;
    let currentepisodetime;
    let nofepisodesbeforeseason = 0;

    if(season != "1"){
        nofepisodesbeforeseason = await seasonepisodetoglobalepisode(imdbid, season);
        console.log(nofepisodesbeforeseason)
    }

    await axios.get('http://localhost:3000/shows/' + showname, {
    }).then(resp => {
        currentepisode = resp.data.episode;
        currentepisodetime = resp.data.time;
    });

    let query = "i="+imdbid;
    let movie = false;

    console.log("this is startepisode: " + startepisde + "/this is endepisode " + endepisode)

    if(isNaN(startepisde) && isNaN(endepisode)){
        movie = true;
        startepisde = 1;
        endepisode = 1;
    }

    console.log("this is startepisode: " + startepisde + "/this is endepisode " + endepisode)

    for(let i = startepisde; i<=endepisode; i++){
        let bookmark = "";
        let time = "";
        let finalquery

        if(!movie){
            finalquery = query+"&season="+season+"&episode=" + i;
        }else{
            finalquery = query;
        }


        if(currentepisode === i.toString()){
            console.log("test")
            bookmark = "✔"
            time = currentepisodetime;
        }

        let response = await axios.get('http://www.omdbapi.com/?apikey=4c33291e&' + finalquery);
        let showlink = "http://animeowl.net/" + animeowl + "/?ep_id=" + linkmatches[i-1][1]
        let rating;

        if(response.data.imdbRating){
            rating = response.data.imdbRating
        }
        else{
            rating = "N/A"
        }

        $('#episodelist').append("<tr id = '" + showname+ "'><td style='background-color:" + colorselectortype(typematches[nofepisodesbeforeseason+i-1][1]) + "' class='episode' id ='" + i +"' ><button id = '" + showlink +"' style='background-color:" + colorselectortype(typematches[nofepisodesbeforeseason+i-1][1]) + "' class ='w3-button watch'>" + "Episode " + i + "</button></td><td class = 'rating' style='background-color:" + colorselector(rating) + "' ><span>"  + rating + "</span></td><td class = 'imdb' style='background-color:#f2f2f2'><a target=\"_blank\" href='https://www.imdb.com/title/" + response.data.imdbID + "'>IMDB</a></td><td style = 'background-color:#f2f2f2'><button class = 'w3-button Bookmark'>Bookmark</button></td><td style = 'background-color: #f2f2f2'><input class = 'timeinput' style = 'outline:none; border:none; border-color:transparent; background-color: #f2f2f2; padding-left: 6px' id = 'time_"+i+"' placeholder='00:00' size='3' maxlength='5'></td><td style = 'background-color:#f2f2f2'><span>" + bookmark + "</span></td></tr>");
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
    let currentbookmark = await axios.get('http://localhost:3000/shows/' + showname);

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

    axios.patch('http://localhost:3000/shows/' + showname, {
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

$("#modalsubmit").click(function(){
    $(this).parent().parent()[0].style.display = "none";
    let animeowl = $("#AnimeOwlName").val()
    let animefillerlist = $("#FillerListNames").val()
    let imdbid = $("#ImdbID").val()
    let season = $("#Season").val()

    if(season === ""){
        season = "1";
    }

    axios.post('http://localhost:3000/shows', {
        id: animeowl.replaceAll("-"," "),
        episode: "",
        time: "",
        animeowl: animeowl,
        animefillerlist: animefillerlist,
        imdbid: imdbid,
        season: season
    }).then(resp => {
        updateavailability();
    })
});

$("#showmodal").click(function(){
    $(this).parent().siblings()[3].style.display = "flex";
});

jQuery.ui.autocomplete.prototype._resizeMenu = function () {
    var ul = this.menu.element;
    ul.outerWidth(this.element.outerWidth());
}

$(function() {
    $("#showname").autocomplete({
        source:availableshows,
        minLength: 2,
        delay: 0
    });
});









