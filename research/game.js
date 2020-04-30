const textElement = document.getElementById('text')
const optionButtonElements = document.getElementById('option-buttons')
const flowers = document.getElementById('flowerGIF')
const repeatBtn = document.getElementById('repeat')
window.utterances = []

let state = {}
let chosenOptions = []
let utterances = []
var audios = []
var lastOption = {}


repeatBtn.addEventListener('click', () => {
    repeatBtn.style.visibility = 'hidden';
    console.log("repeat button clicked")
    flowers.style.visibility = 'visible'
    repeatAudio(lastOption)
})

let validVoices = {
      'Google US English': 0.75, //en-US M
      'Daniel': 0.9, //en-GB M
      'Google UK English Female': 0.75, //en-GB F
      'Victoria': 0.85,
  }
  let voiceNames = Object.keys(validVoices)
  let voiceIndex = Math.floor(Math.random() * voiceNames.length);
  let chosenName = voiceNames[voiceIndex]
  console.log(chosenName)
var chosenVoice = null
var voices = null;

function startGame() {
    repeatBtn.style.visibility = 'hidden';
    if (getCookie("completed") === "true") {
        while (optionButtonElements.firstChild) {
            optionButtonElements.removeChild(optionButtonElements.firstChild)
        }
    }
    else {
        state = {}
        chosenOptions = []
        utterances = []
        while (optionButtonElements.firstChild) {
            optionButtonElements.removeChild(optionButtonElements.firstChild)
        }
        flowers.style.visibility = 'hidden';
        let s = setSpeech();
        s.then(showTextNode(1000000000))
    }
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
  

function showTextNode(textNodeIndex) {

    chosenOptions.push(textNodeIndex)
    const textNode = textNodes.find(textNode => textNode.id === textNodeIndex)
    while (optionButtonElements.firstChild) {
        optionButtonElements.removeChild(optionButtonElements.firstChild)
    }
    textNode.options.forEach(option => {
        if (showOption(option)) {
            const button = document.createElement('button')
            button.innerText = option.text
            button.classList.add('btn')
            button.addEventListener('click', () => selectOption(option))
            optionButtonElements.appendChild(button)
        }
    })
}

function showOption(option) {
    return option.requiredState == null || option.requiredState(state)
}

function selectOption(option) {
    const nextTextNodeID = option.nextText
    lastOption = option
    if (nextTextNodeID <= 0) {
        //Upload state to database
        document.cookie = "completed=true; expires=Thu, 18 Dec 2021 12:00:00 UTC";
        firebase.database().ref('users/').push({
          "name": chosenName,
          "choices": chosenOptions
        })
    }
    if (option.audio) {
      audios.forEach(playingSong => {
          fadeOut(playingSong)
      })
      audios = [];
      var audio = new Audio(option.audio);
      audio.loop = true;
      audio.volume = 0.4;
      audios.push(audio)
      audio.play()
    }

    state = Object.assign(state, option.setState)
    while (optionButtonElements.firstChild) {
        optionButtonElements.removeChild(optionButtonElements.firstChild)
    }
    flowers.style.visibility = 'visible';
    //Waiting for audio to play a bit before contiue
    var waitingTime = 0;
    if (option.timeWait) {
      waitingTime = option.timeWait;
    }
    setTimeout(function(){
      if (option.soundEffect) {
        //Some extra sound effect to play
        var soundEffect = new Audio(option.soundEffect);
        soundEffect.volume = 0.2;
        audios.push(soundEffect)
        soundEffect.play()
      }
    }, waitingTime / 2.5);
    setTimeout(function(){
      say(nextTextNodeID)
    }, waitingTime);
  }

  function fadeOut(sound) {
    if( sound.volume > 0 ) { // only if we're not yet at 0
      setTimeout(function() {
        sound.volume -= 0.1;
        fadeOut( sound ); // do it again after one second
      }, 300);
    }
  }  

  function say(textNodeIndex) {
    repeatBtn.style.visibility = 'hidden'
    const m = textNodes.find(textNode => textNode.id === textNodeIndex)
    // var msg = new SpeechSynthesisUtterance(m.text);
    var voices = window.speechSynthesis.getVoices();
  // if ("speechSynthesis" in window) {
  //   speechSynthesis.onvoiceschanged = function () {
  //     var $voicelist = $("#voices");
  //
  //     if ($voicelist.find("option").length == 0) {
  //       speechSynthesis.getVoices().forEach(function (voice, index) {
  //         var $option = $("<option>")
  //           .val(index)
  //           .html(voice.name + (voice.default ? " (default)" : ""));
  //
  //         $voicelist.append($option);
  //       });
  //
  //       $voicelist.material_select();
  //     }
  //   };

      // var text = $("#message").val();
    voices = window.speechSynthesis.getVoices();
    // console.log(voices.length);
    for (var i = 0; i < voices.length; i++) {
      // console.log(voices[i])
      if (voices[i].name == chosenName) {
          chosenVoice = voices[i]
          break
      }
    }
      var msg = new SpeechSynthesisUtterance();
      msg.voice = chosenVoice; //50
      msg.rate = validVoices[chosenName];
      msg.pitch = 1;
      msg.text = m.text;

      msg.onend = function (e) {
          flowers.style.visibility = 'hidden';
          if (textNodeIndex > 0) {
              repeatBtn.style.visibility = 'visible';
          }
          console.log("message ended")
          showTextNode(textNodeIndex)
      };

      utterances.push( msg );
      speechSynthesis.speak(msg);
}


function setSpeech() {
    return new Promise(
        function (resolve, reject) {
            let synth = window.speechSynthesis;
            let id;

            id = setInterval(() => {
                if (synth.getVoices().length !== 0) {
                    resolve(synth.getVoices());
                    clearInterval(id);
                }
            }, 10);
        }
    )
}

function repeatAudio (option) {
    selectOption(option);
}

const textNodes = [
    {
        id: 1000000000,
                options: [
            {
                text: "Start ",
                nextText: 1,
            },
        ],
    },
{
        id: 1,
        text: "Before we begin, some information for this research. What is your gender?",
        options: [
            {
                                                                text: "Male ",
                nextText: 2,
            },
            {
                                                                text: "Female ",
                nextText: 2,
            },
        ],
    },
{
        id: 2,
        text: "What is your age group?",
        options: [
            {
                                                                text: "0-18 ",
                nextText: 3,
            },
            {
                                                                text: "19-30 ",
                nextText: 3,
            },
            {
                                                                text: "31-45 ",
                nextText: 3,
            },
            {
                                                                text: "46+ ",
                nextText: 3,
            },
        ],
    },
{
        id: 3,
        text: "Hello, I am your guide for today. I do not have a name, but I am glad to have met you. You are part of an experiment; every choice you make has consequences. I will be taking you on a journey, far, far away. Ready to begin?",
        options: [
            {
                text: "Begin Adventure ",
                nextText: 4,
                soundEffect: "train.mp3",
                audio: "intro.mp3",
                timeWait: 7000
            },
        ],
    },
{
        id: 4,
        text: "The year is 1900. You live in London, near the central city. Smog is everywhere. Everything reeks of filth. You wake up to the yelling of your mother. Do you respond?",
        options: [
            {
                                                                text: "Ask what she wants ",
                nextText: 5,
            },
            {
                                                                text: "Ignore her ",
                nextText: 6,
            },
        ],
    },
{
        id: 5,
        text: "There isn’t any bread left in the house and you need to go buy some from the market. Your mother gives you some money to buy some.",
        options: [
            {
                                                                text: "Ask for more money ",
                nextText: 8,
            },
            {
                text: "Head outside ",
                audio: "market.mp3",
                timeWait: 3000,
                nextText: 9,
            },
        ],
    },
{
        id: 6,
        text: "Your mother gives you the option to sleep in and make breakfast for the family instead. Do you get up or sleep in?",
        options: [
            {
                                                                text: "Wake up and do what she wants ",
                nextText: 5,
            },
            {
                                                                text: "Go downstairs and make breakfast ",
                nextText: 7,
            },
        ],
    },
{
        id: 7,
        text: "What will you plan to make?",
        options: [
            {
                                                                text: "French Toast ",
                nextText: 5,
            },
            {
                                                                text: "Buttered bread ",
                nextText: 5,
            },
        ],
    },
{
        id: 8,
        text: "Your mother scoffs at you. There’s barely money in the house, anyways.",
        options: [
            {
                text: "Leave the house ",
                audio: "market.mp3",
                timeWait: 3000,
                nextText: 9,
            },
        ],
    },
{
        id: 9,
        text: "You make your way through the city's winding roads until the traffic gets noticeably heavier. As you enter the market, a couple of different shops catch your eye. Which one do you enter?",
        options: [
            {
                                                                text: "Grocery Store ",
                nextText: 10,
            },
            {
                                                                text: "Smoke Store ",
                nextText: 11,
            },
            {
                                                                text: "Gimmick Store",
                nextText: 12,
            },
        ],
    },
{
        id: 10,
        text: "You’re at the grocery store now. What would you like to buy?",
        options: [
            {
                                                                text: "Bread ",
                nextText: 10,
            },
            {
                                                                text: "Fish corpse",
                nextText: 10,
            },
            {
                                                                text: "Leave ",
                nextText: 13,
            },
        ],
    },
{
        id: 11,
        text: "You’re at the smoke store now.",
        options: [
            {
                                                                text: "Cigarette ",
                nextText: 11,
            },
            {
                                                                text: "Cigar ",
                nextText: 11,
            },
            {
                                                                text: "Leave ",
                nextText: 13,
            },
        ],
    },
{
        id: 12,
        text: "You’re at the gimmicks store now.",
        options: [
            {
                                                                text: "Yo-yo ",
                nextText: 12,
            },
            {
                                                                text: "Pack of cards ",
                nextText: 12,
            },
            {
                                                                text: "Leave ",
                nextText: 13,
            },
        ],
    },
{
        id: 13,
        text: "Do you want to leave the market?",
        options: [
            {
                                                                text: "Go to Gimmick Store ",
                nextText: 12,
            },
            {
                                                                text: "Go to Grocery Store ",
                nextText: 10,
            },
            {
                                                                text: "Go to Smoke Store ",
                nextText: 11,
            },
            {
                                                                text: "Leave the market ",
                nextText: 14,
            },
        ],
    },
{
        id: 14,
        text: "As you leave the market, you hear a commotion coming in the distance. People are yelling loudly. Do you head towards the noise?",
        options: [
            {
                text: "Head towards noise ",
                nextText: 15,
            },
            {
                text: "Ignore noise and head home ",
                nextText: 17,
            },
        ],
    },
{
        id: 15,
        text: "There's a large crowd around you, now, and a large, hooded figure sprints towards you. He's clutching an expensive, embroidered purse in his hands. He's a thief, and everyone's trying to stop him. Do you confront the thief?",
        options: [
            {
                text: "Confront him ",
                audio: "fight.mp3",
                timeWait: 3000,
                nextText: 18,
            },
            {
                text: "Don't confront him ",
                nextText: 500,
                audio: "trek.mp3",
                timeWait:4000
            },
        ],
    },
{
        id: 17,
        text: "You choose to turn the other way and walk towards home. A few minutes later, a hooded figure brushes past you, walking quickly. You see that he is holding a pink, embroidered purse in stark contrast to his dark outfit. It's obvious that the purse is not his, and you realize this is what was causing the commotion earlier. Do you confront the thief?",
        options: [
            {
                text: "Confront him ",
                audio: "fight.mp3",
                timeWait: 3000,
                nextText: 18,
            },
            {
                text: "Don't confront him ",
                nextText: 500,
                audio: "trek.mp3",
                timeWait:4000
            },
        ],
    },
{
        id: 18,
        text: "You yell at the man to stop, but he begins to run even faster until he's past you now. You start following him faster. The man seems dangerous, and it looks like he's carrying a knife. If you jump on him, you should be able to stop him, but it might be kind of risky.",
        options: [
            {
                text: "Tackle the man ",
                nextText: 19,
            },
            {
                text: "Throw a rock at him ",
                nextText: 20,
            },
        ],
    },
{
        id: 19,
        text: "You jump on the man and tussle on the ground. He grunts, reaches for his pocket, and pats you on your chest before pushing you off and sprinting away. You stand there, and a few people from afar rush to commend you. You can't help feeling helpless, though.",
        options: [
            {
                                                                text: "Take the short way home ",
                nextText: 21,
            },
            {
                                                                text: "Take the long way home ",
                nextText: 21,
            },
        ],
    },
{
        id: 20,
        text: "The rock bounces off the man. Before you can realize what's happening, the man runs back to you, pats your chest, and then disappears into the winding streets of London.",
        options: [
            {
                                                                text: "Take the short way home ",
                nextText: 21,
            },
            {
                                                                text: "Take the long way home ",
                nextText: 21,
            },
        ],
    },
{
        id: 21,
        text: "As you're walking home, it begins to rain. You take your time, but as you're walking you notice your shirt pocket feeling a bit heavier. You reach inside and find a note.",
        options: [
            {
                                                                text: "Read the note ",
                nextText: 22,
            },
        ],
    },
{
        id: 22,
        text: "The note is almost illegible, but you can make out an address. It must have been the thief. It's in the sketchier areas of London. Do you head towards it?",
        options: [
            {
                                                                text: "Head towards address ",
                nextText: 23,
            },
            {
                                                                text: "Ignore Note ",
                nextText: 24,
            },
        ],
    },
{
        id: 23,
        text: "You turn around in the street, then turn around again. Finally, you find your sense of direction. Time to see what's going on.",
        options: [
            {
                text: "Start trek ",
                audio: "trek.mp3",
                timeWait: 4000,
                nextText: 25,
            },
        ],
    },
{
        id: 24,
        text: "You ignore the note, but curiosity gets the better of you. You turn around and start towards the foreign district.",
        options: [
            {
                text: "Start trek ",
                audio: "trek.mp3",
                timeWait: 4000,
                nextText: 25,
            },
        ],
    },
{
        id: 25,
        text: "As you're walking, you notice the streets becoming dirtier. Everything is dark and gloomy here. A homeless man comes up to you, trying to talk. He looks sketchy, and you don't know where he's been. Do you engage?",
        options: [
            {
                                                                text: "Talk with him ",
                nextText: 26,
            },
            {
                                                                text: "Ignore him ",
                nextText: 29,
            },
        ],
    },
{
        id: 26,
        text: "He asks where you're heading.",
        options: [
            {
                                                                text: "Show him the address ",
                nextText: 27,
            },
            {
                                                                text: "Tell him you're heading home ",
                nextText: 28,
            },
        ],
    },
{
        id: 27,
        text: "The man looks at the address and thinks for a bit. Suddenly, his eyes widen and he starts walking away. Unexpectedly, the homeless man swerves in front of a train which hits him.",
        options: [
            {
                                                                text: "Continue walking ",
                nextText: 29,
            },
        ],
    },
{
        id: 28,
        text: "The man calls you a liar. No one lives around these parts. With that, he turns and walks away. Unexpectedly, the homeless man swerves in front of a train which hits him.",
        options: [
            {
                                                                text: "Continue walking ",
                nextText: 29,
            },
        ],
    },
{
        id: 29,
        text: "All the buildings are grimy, now, and blackness is everywhere. Finally, you arrive at the address. It's a small bookstore stuck between two non descript buildings, two non descript buildings, two. Sorry, I messed up. You climb up the stairs until you reach the door. ",
        options: [
            {
                text: "Knock ",
                nextText: 30,
            },
            {
                text: "Walk in ",
                audio: "creepy.mp3",
                timeWait: 3000,
                nextText: 32,
            },
        ],
    },
{
        id: 30,
        text: "You knock on the door, but no one opens. Weird, weird, isn't it all so weird?",
        options: [
            {
                text: "Turn around ",
                nextText: 31,
            },
            {
                text: "Walk in ",
                audio: "creepy.mp3",
                timeWait: 3000,
                nextText: 32,
            },
        ],
    },
{
        id: 31,
        text: "As you're walking down the stairs, the door to the store slowly creaks open.",
        options: [
            {
                text: "Enter store ",
                audio: "creepy.mp3",
                timeWait: 3000,
                nextText: 32,
            },
        ],
    },
{
        id: 32,
        text: "You enter, but there's no one inside. The store is grim and cluttered, with bookshelves and novels strewn around carelessly. Where do you begin?",
        options: [
            {
                                                                text: "Head towards cage ",
                nextText: 33,
            },
            {
                                                                text: "Search books ",
                nextText: 34,
            },
            {
                                                                text: "Search counter ",
                nextText: 35,
            },
        ],
    },
{
        id: 33,
        text: "There looks to be an animal cage here, but there's no animal in sight. There's a bit of stale food here, but nothing else",
        options: [
            {
                                                                text: "Search Books ",
                nextText: 34,
            },
            {
                                                                text: "Search counter ",
                nextText: 35,
            },
        ],
    },
{
        id: 34,
        text: "There's a variety of different books here, but none of them seem too interesting.",
        options: [
            {
                                                                text: "Head towards cage ",
                nextText: 33,
            },
            {
                                                                text: "Search counter ",
                nextText: 35,
            },
        ],
    },
{
        id: 35,
        text: "As you head towards the counter, you notice an unsusual crevice in the wall. You walk a bit closer to it, cautious of why it's there. As you get closer, you realize it's actually a tunnel dug into the wall, but it's completely dark. Do you enter?",
        options: [
            {
                                                                text: "Enter the tunnel ",
                nextText: 37,
            },
            {
                                                                text: "Back off ",
                nextText: 36,
            },
        ],
    },
{
        id: 36,
        text: "You walk away from the tunnel, but as you walk away you slip on a rug and fall into a hole. Except, it's not just a hole. You're falling, now, sliding down some type of slide.",
        options: [
            {
                                                                text: "Cover your head ",
                nextText: 38,
            },
        ],
    },
{
        id: 37,
        text: "You enter the tunnel, and walk forward a bit. It's pitch black. Suddenly, you're falling. Falling, falling, into a slide, endlessly. ",
        options: [
            {
                                                                text: "Cover your head ",
                nextText: 38,
            },
        ],
    },
{
        id: 38,
        text: "After some time, you land on some soft cushioning in a dimly lit room. It's small, with only a door decorating any walls. After some time, a man enters and tells you to follow him. You try talking to him, but he doesn't respond.",
        options: [
            {
                text: "Follow man through door ",
                nextText: 39,
                audio: "fantasy.mp3", 
                timeWait: 4000
            },
        ],
    },
{
        id: 39,
        text: "You walk through the door and notice the air feels different. Your eyes take a second to adjust to the torches, but when they do you realize you're in a huge cave. It's massive; the top of the cave is hundreds of feet above you, and carts and tracks line the walls, spiralling in endless directions. There's hundreds of people here, bustling in every direction. They all seem occupied. The cave is endless, almost like you're in an underground society.",
        options: [
            {
                                                                text: "Follow man into cart ",
                nextText: 40,
            },
        ],
    },
{
        id: 40,
        text: "As you enter the cart, the man pulls a lever that takes you zipping away. You slowly rise, climbing up the tracks and onto the walls of the cave. As you're speeding through, you notice someone's cart derail and crash, surely killing whoever is inside. The man doesn't acknwoledge them, though.",
        options: [
            {
                                                                text: "Enjoy the ride ",
                nextText: 41,
            },
        ],
    },
{
        id: 41,
        text: "Finally, the man, the man, sorry, I messed up. Finally, the man turns around and acknowledges you. I liked you, kid, that you fought back earlier today. ",
        options: [
            {
                                                                text: "Nod at the thief ",
                nextText: 42,
            },
            {
                                                                text: "Stay quiet ",
                nextText: 42,
            },
        ],
    },
{
        id: 42,
        text: "You see, we're an underground resistance group against the rich in London. We're a Robin Hood, of sorts, and now you're a part of us.",
        options: [
            {
                                                                text: "Object ",
                nextText: 43,
            },
            {
                                                                text: "Nod ",
                nextText: 43,
            },
        ],
    },
{
        id: 43,
        text: "You don't have much of a choice here, really. Now that you're here, you're a part of us. With that, the man stops talking and the cart slows to a stop. Hundreds of feet above the ground.",
        options: [
            {
                                                                text: "Follow the man out ",
                nextText: 44,
            },
        ],
    },
{
        id: 44,
        text: "You're on a small ledge now. Now, finally, finally, finally, after so long, the man turns to you, quietly, and jumps off the ledge.",
        options: [
            {
                                                                text: "Jump after the man ",
                nextText: 45,
            },
            {
                                                                text: "Back away ",
                nextText: 46,
            },
        ],
    },
{
        id: 45,
        text: "You prepare to jump, but a boy pulls you away. He takes you by the hand and leads you to a room indented in the wall.",
        options: [
            {
                                                                text: "Follow him ",
                nextText: 47,
            },
        ],
    },
{
        id: 46,
        text: "You back away, and a boy appears who grabs you by the wrist and pulls you into a room indented in the wall.",
        options: [
            {
                                                                text: "Follow him ",
                nextText: 47,
            },
        ],
    },
{
        id: 47,
        text: "He pushes you into the room, where there's a man in a cloak in the corner. He's in the corner, the man in the cloak. There's a man in the cloak, in the corner. Ha ha ha.",
        options: [
            {
                text: "Approach me ",
                audio: "hum.mp3", 
                timeWait: 5000,
                nextText: 1000,
            },
            {
                                                                text: "Ignore me ",
                nextText: 48,
            },
        ],
    },
{
        id: 48,
        text: "I have let you have your fun. Now do not forget who is really in charge here.",
        options: [
            {
                text: "Approach me ",
                audio: "hum.mp3", 
                timeWait: 5000,
                nextText: 1000,
            },
            {
                text: "Approach Me ",
                audio: "hum.mp3", 
                timeWait: 5000,
                nextText: 1000,
            },
        ],
    },
{
        id: 500,
        text: "You figure that that's none of your business and continue on your merry way. You zone out for a bit in your stroll until the sound of a ship's horn breaks you out of your daydreaming. This must be the ship bound for America that everybody's been talking about. ",
        options: [
            {
                text: "Explore the ship ",
                nextText: 501,
            },
            {
                text: "Explore the shoreline ",
                nextText: 502,
            },
        ],
    },
{
        id: 501,
        text: "As you walk onto the dock, a grimy man stops you. He says, You need a ticket to get onto the ship. Lucky for you, I have an extra that I'm giving away for only 2 coins.",
        options: [
            {
                                                                text: "Buy the ticket ",
                nextText: 503,
            },
            {
                                                                text: "Double back and try to sneak by him.",
                nextText: 503,
            },
        ],
    },
{
        id: 502,
        text: "As you walk along the shoreline, your eyes focus on the distant horizon and you watch the waves crash onto the shore. You sit down on the dock and feel more at peace than you have for a long time. In your lull of focus, you don't realize how dark it gets until you can barely see.",
        options: [
            {
                                                                text: "Make your way home ",
                nextText: 504,
            },
            {
                                                                text: "Find a place to sleep ",
                nextText: 505,
            },
        ],
    },
{
        id: 503,
        text: "You manage to get by and make your way up to the ship, one of the largest you have ever seen in your life. People are milling around preparing for the next trip and there are barrels of goods you have never seen before scattered everywhere. Soon it gets late, and the sky grows dark.",
        options: [
            {
                                                                text: "Make you your way back home ",
                nextText: 504,
            },
            {
                                                                text: "Stay a bit longer to check out the lower deck ",
                nextText: 505,
            },
        ],
    },
{
        id: 504,
        text: "As you turn towards home, you realize you have made a grave mistake. The cloudy sky and how far you are from the main city makes it difficult to see more than a couple meters. You stumble around for a few moments before you realize it's hopeless.",
        options: [
            {
                                                                text: "Find a place to sleep until morning",
                nextText: 505,
            },
        ],
    },
{
        id: 505,
        text: "You blindlessly walk around until you venture up a sloped area, lay down, clutch your bag tightly, and close your eyes.",
        options: [
            {
                text: "Sleep",
                nextText: 506,
                audio: "ocean.mp3",
                timeWait: 4000
            },
        ],
    },
{
        id: 506,
        text: "You wake up feeling a bit nauseous and have the sense that something is not quite right. The earth feels like it is swaying beneath you and your bag is no longer in your arms.",
        options: [
            {
                                                                text: "Look for your bag ",
                nextText: 507,
            },
            {
                                                                text: "Look around ",
                nextText: 509,
            },
        ],
    },
{
        id: 507,
        text: "Groggily, you fumble around in the night along the ground, groping around for your bag. It doesn't seem to be in close proximity.",
        options: [
            {
                                                                text: "Look further away ",
                nextText: 508,
            },
            {
                                                                text: "Keep searching in a close circle ",
                nextText: 508,
            },
        ],
    },
{
        id: 508,
        text: "After unsucessfully reaching in the darkness around you, you are forced to get up to continue the search.",
        options: [
            {
                                                                text: "Stand up ",
                nextText: 509,
            },
        ],
    },
{
        id: 509,
        text: "Best as you can, you stand up and survey your surroundings. The sinking feeling you had is confirmed.",
        options: [
            {
                                                                text: "You are on a ship ",
                nextText: 510,
            },
        ],
    },
{
        id: 510,
        text: "As unbelievable as it is, you finally accept that you are aboard a ship. You have no idea how far you are from shore. ",
        options: [
            {
                                                                text: "Try to swim back ",
                nextText: 511,
            },
            {
                                                                text: "Stay on the ship",
                nextText: 514,
            },
        ],
    },
{
        id: 511,
        text: "The thought of leaving your life behind is too much. You rashly decide to jump ship. But as you make your way towards, the ship railing, a young, high pitched voice calls out to you. You hear them yell out. Don't even think about jumping, we are miles from shore.",
        options: [
            {
                                                                text: "Risk putting a face to the voice ",
                nextText: 513,
            },
            {
                                                                text: "Hide ",
                nextText: 512,
            },
        ],
    },
{
        id: 512,
        text: "You quickly head in the opposite direction of the voice and hide behind a small cabin. You hear footsteps quickly approaching.",
        options: [
            {
                                                                text: "Move hiding spots ",
                nextText: 513,
            },
            {
                                                                text: "Stay where you are ",
                nextText: 513,
            },
        ],
    },
{
        id: 513,
        text: "You were never the best at hide and seek. A person turns the corner and spots you. There you are!",
        options: [
            {
                                                                text: "Meet him ",
                nextText: 514,
            },
        ],
    },
{
        id: 514,
        text: "The young boy grins devilishly at you. Hey, I haven't seen you around here before! You are not supposed to be here are you?",
        options: [
            {
                                                                text: "Tell him the truth ",
                nextText: 515,
            },
            {
                                                                text: "Lie ",
                nextText: 516,
            },
        ],
    },
{
        id: 515,
        text: "You tell the truth about your situation. Good. I like players that tell . I mean, the boy seems to accept your explanation. Makes sense, cause you don't look prepared for a long journey. The boy takes.a step forward.",
        options: [
            {
                                                                text: "Continue talking ",
                nextText: 517,
            },
            {
                                                                text: "Back away ",
                nextText: 517,
            },
        ],
    },
{
        id: 516,
        text: "You lie! How dare you lie to me, lie to the boy. Don't you know liars deserve to be punished? Things do not end well when one attempts to conceal the truth, said the young boy. The boy takes a step forward.",
        options: [
            {
                                                                text: "Apologize ",
                nextText: 518,
            },
            {
                                                                text: "Back away ",
                nextText: 517,
            },
        ],
    },
{
        id: 517,
        text: "The way that the boy looks at you is uncanny. You decide to make a run for it. You arrive at the front of what looks to be the captain's cabin. ",
        options: [
            {
                                                                text: "Barge inside ",
                nextText: 519,
            },
            {
                                                                text: "Keep running ",
                nextText: 520,
            },
        ],
    },
{
        id: 518,
        text: "The boy gets closer. You don't belong belong here. You don't don't belong. Don't belong. ",
        options: [
            {
                                                                text: "Shove the boy ",
                nextText: 520,
            },
            {
                                                                text: "Run into the captain's cabin ",
                nextText: 519,
            },
        ],
    },
{
        id: 519,
        text: "You break in. At first, it seems empty, until you notice a body slumped over the central desk. It stirs at your entrance.",
        options: [
            {
                                                                text: "Investigate the mysterious body ",
                nextText: 520,
            },
            {
                                                                text: "Go back outside ",
                nextText: 521,
            },
        ],
    },
{
        id: 520,
        text: "Before you ma make make your next move, the boy seems to relax and his body becomes ragdoll like. He loses complete interest in you as he turns around and walks confidently to the edge of the ship. Then, the young, innocent boy that did nothing wrong throws himself off the ship.",
        options: [
            {
                                                                text: "End this nightmare ",
                nextText: 522,
            },
            {
                                                                text: "Keep exploring ",
                nextText: 523,
            },
        ],
    },
{
        id: 521,
        text: "As you take your next step, the body suddenly comes to life, straightening quickly and staring at you you who doesn't belong here belong here. With a blank stare in his face, he walks by you, onto the deck, and off the edge the ship, into the sea. The boy is nowhere to be found.",
        options: [
            {
                                                                text: "End this nightmare ",
                nextText: 522,
            },
            {
                                                                text: "Keep exploring ",
                nextText: 523,
            },
        ],
    },
{
        id: 522,
        text: "You decide you have had enough of my the nonsense and you decide to sleep, so you lay back down.",
        options: [
            {
                                                                text: "Close your eyes ",
                nextText: 524,
            },
        ],
    },
{
        id: 523,
        text: "You look around the ship, but it seems to be completely lifeless. For the moment, everyone seems to be asleep and the ship steers itself through the night. Your eyes get droopy from the confusion of the past few minutes, and you lay down.",
        options: [
            {
                                                                text: "Sleep ",
                nextText: 524,
            },
        ],
    },
{
        id: 524,
        text: "You have a weird dream. You see 10 people with their backs turned near the railing of the ship. One by one, they begin calmly to step off the edge into the treacherous ocean below.",
        options: [
            {
                                                                text: "Wake up ",
                nextText: 525,
            },
        ],
    },
{
        id: 525,
        text: "As you awaken, you see the more people milling about the ship but something is not right. There is a certain stillness in the air, as if the people do not know each other exist.",
        options: [
            {
                                                                text: "Ask someone what is going on ",
                nextText: 526,
            },
            {
                                                                text: "Ignore them ",
                nextText: 526,
            },
        ],
    },
{
        id: 526,
        text: "They say nothing and do not even acknowledge us. They keep their eyes fixed on the distance as if they are but shells of a real person. Randomly, people disappear off the ship into the sea, without purpose or reason. This is not their place, just like it is not yours.",
        options: [
            {
                                                                text: "What is going on? ",
                nextText: 527,
            },
        ],
    },
{
        id: 527,
        text: "You turn towards the bow of the ship and you see a figure with their back turned that doesn't seem quite like the others. ",
        options: [
            {
                text: "Approach me ",
                nextText: 1000,
                audio: "hum.mp3",
                timeWait: 5000
            },
            {
                                                                text: "Ignore me ",
                nextText: 528,
            },
        ],
    },
{
        id: 528,
        text: "I have let you have your fun. Now do not forget who is really in charge here.",
        options: [
            {
                text: "Approach me ",
                nextText: 1000,
                audio: "hum.mp3",
                timeWait: 5000
            },
            {
                text: "Approach me ",
                nextText: 1000,
                audio: "hum.mp3",
                timeWait: 5000
            },
        ],
    },
{
        id: 1000,
        text: "You're a smart one. Look, I'll admit it, it was me, the narrator. I was the one causing all the problems. Look, sometimes the world needs some evil.",
        options: [
            {
                                                                text: "Keep listening ",
                nextText: 1001,
            },
            {
                                                                text: "Ignore me ",
                nextText: 1001,
            },
        ],
    },
{
        id: 1001,
        text: "Do you really think you have a choice here? I control what happens next and I control this world.",
        options: [
            {
                                                                text: "Keep listening ",
                nextText: 1002,
            },
            {
                                                                text: "Ignore me ",
                nextText: 1002,
            },
        ],
    },
{
        id: 1002,
        text: "Silly, silly, player. I killed everyone. You think you matter? You're just a pawn in this game, nothing more than an observer.",
        options: [
            {
                                                                text: "Keep listening ",
                nextText: 1003,
            },
            {
                                                                text: "Ignore me ",
                nextText: 1003,
            },
        ],
    },
{
        id: 1003,
        text: "You fool, it was me all along. Do you want to talk to me, now? Maybe get to know me?",
        options: [
            {
                                                                text: "Talk with me ",
                nextText: 1004,
            },
            {
                                                                text: "Stay quiet ",
                nextText: 1006,
            },
        ],
    },
{
        id: 1004,
        text: "I'm glad you've decided to talk. So, how have you been today? Answer nicely and maybe I'll let the other people you've met stay alive.",
        options: [
            {
                                                                text: "Doing well ",
                nextText: 1006,
            },
            {
                                                                text: "Doing bad ",
                nextText: 1006,
            },
        ],
    },
{
        id: 1006,
        text: "Woops. I really don't care, either way. Do you remember your mother, the one who made you get bread? Yeah, well, she's dead now too. Ha. Ha. Ha.",
        options: [
            {
                                                                text: "Yell at me ",
                nextText: 1007,
            },
            {
                                                                text: "Stay quiet ",
                nextText: 1007,
            },
        ],
    },
{
        id: 1007,
        text: "I don't care what you do, anymore, really. Look, I'll tell you what to do, now, and you better listen. Press the button on the left, or it's not going to be good.",
        options: [
            {
                                                                text: "Left ",
                nextText: 1008,
            },
            {
                                                                text: "Right ",
                nextText: 1009,
            },
        ],
    },
{
        id: 1008,
        text: "Good, good, you follow instructions nicely. Press the button on the left again.",
        options: [
            {
                                                                text: "Left ",
                nextText: 1011,
            },
            {
                                                                text: "Right ",
                nextText: 1010,
            },
        ],
    },
{
        id: 1009,
        text: "You 're making me angry. Press the button on the left again.",
        options: [
            {
                                                                text: "Left ",
                nextText: 1011,
            },
            {
                                                                text: "Right ",
                nextText: 1010,
            },
        ],
    },
{
        id: 1010,
        text: "That's it. You've disobeyed me one too many times. I'm going to punish you. I'm going to make someone else the narrator now.",
        options: [
            {
                text: "Accepty ",
                nextText: 1012,
            },
        ],
    },
{
        id: 1011,
        text: "Look, I don't care that you've been good. I'm going to punish you. I'm going to make someone else the narrator now.",
        options: [
            {
                text: "Accept ",
                nextText: 1012,
                timeWait: 7000,
                audio: "end.mp3"
            },
        ],
    },
{
        id: 1012,
        text: "The year is 2020.",
        options: [
            {
                                                                text: "Continue ",
                nextText: 1013,
            },
        ],
    },
{
        id: 1013,
        text: "There's someone sitting in front of a screen, playing a game for research.",
        options: [
            {
                                                                text: "Continue ",
                nextText: 1014,
            },
        ],
    },
{
        id: 1014,
        text: "They've finished the game, now and are reaching the end.",
        options: [
            {
                                                                text: "Continue ",
                nextText: 1015,
            },
        ],
    },
{
        id: 1015,
        text: "But, did they ever have any control of the game to begin with?",
        options: [
            {
                                                                text: "Continue ",
                nextText: -1,
            },
        ],
    },
{
        id: -1,
        text: "Who knows? They're done with the game, and they close the browser once and for all.",
            },
]



startGame()

var canvas = document.getElementById('canvas'),
  context = canvas.getContext('2d'),
  canvasWidth = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth),
  canvasHeight = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight),
  requestAnimationFrame = window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame;
var persons = [],
  numberOfFirefly = 30,
  birthToGive = 25;

var colors = [];
/* Galactic Tea - http://www.colourlovers.com/palette/1586746/Galactic_Tea*/
colors[2] = [];
colors[2]['background'] = '#2F294F';
colors[2][1] = 'rgba(74,49,89,';
colors[2][2] = 'rgba(130,91,109,';
colors[2][3] = 'rgba(185,136,131,';
colors[2][4] = 'rgba(249,241,204,';

var colorTheme = 2, //getRandomInt(0,colors.length-1);
  mainSpeed = 1;

function getRandomInt(min, max, exept) {
  var i = Math.floor(Math.random() * (max - min + 1)) + min;
  if (typeof exept == "undefined") return i;
  else if (typeof exept == 'number' && i == exept) return getRandomInt(min, max, exept);
  else if (typeof exept == "object" && (i >= exept[0] && i <= exept[1])) return getRandomInt(min, max, exept);
  else return i;
}

function isEven(n) {
  return n == parseFloat(n) ? !(n % 2) : void 0;
}

function degToRad(deg) {
  return deg * (Math.PI / 180);
}

function Firefly(id) {
  this.id = id;
  this.width = getRandomInt(3, 6);
  this.height = this.width;
  this.x = getRandomInt(0, (canvas.width - this.width));
  this.y = getRandomInt(0, (canvas.height - this.height));
  this.speed = (this.width <= 10) ? 2 : 1;
  this.alpha = 1;
  this.alphaReduction = getRandomInt(1, 3) / 1000;
  this.color = colors[colorTheme][getRandomInt(1, colors[colorTheme].length - 1)];
  this.direction = getRandomInt(0, 360);
  this.turner = getRandomInt(0, 1) == 0 ? -1 : 1;
  this.turnerAmp = getRandomInt(1, 2);
  this.isHit = false;
  this.stepCounter = 0;
  this.changeDirectionFrequency = getRandomInt(1, 200);
  this.shape = 2; //getRandomInt(2,3);
  this.shadowBlur = getRandomInt(5, 25);
}

Firefly.prototype.stop = function() {
  this.update();
}

Firefly.prototype.walk = function() {
  var next_x = this.x + Math.cos(degToRad(this.direction)) * this.speed,
    next_y = this.y + Math.sin(degToRad(this.direction)) * this.speed;

  // Canvas limits
  if (next_x >= (canvas.width - this.width) && (this.direction < 90 || this.direction > 270)) {
    next_x = canvas.width - this.width;
    this.direction = getRandomInt(90, 270, this.direction);
  }
  if (next_x <= 0 && (this.direction > 90 && this.direction < 270)) {
    next_x = 0;
    var exept = [90, 270];
    this.direction = getRandomInt(0, 360, exept);
  }
  if (next_y >= (canvas.height - this.height) && (this.direction > 0 && this.direction < 180)) {
    next_y = canvas.height - this.height;
    this.direction = getRandomInt(180, 360, this.direction);
  }
  if (next_y <= 0 && (this.direction > 180 && this.direction < 360)) {
    next_y = 0;
    this.direction = getRandomInt(0, 180, this.direction);
  }

  this.x = next_x;
  this.y = next_y;

  this.stepCounter++;

  if (this.changeDirectionFrequency && this.stepCounter == this.changeDirectionFrequency) {
    this.turner = this.turner == -1 ? 1 : -1;
    this.turnerAmp = getRandomInt(1, 2);
    this.stepCounter = 0;
    this.changeDirectionFrequency = getRandomInt(1, 200);
  }

  this.direction += this.turner * this.turnerAmp;

  this.update();
}

Firefly.prototype.takeOppositeDirection = function() {
  // Right -> Left
  if ((this.direction >= 0 && this.direction < 90) || (this.direction > 270 && this.direction <= 360)) {
    this.direction = getRandomInt(90, 270);
    return;
  }
  // Left -> Right
  if (this.direction > 90 && this.direction < 270) {
    var exept = [90, 270];
    this.direction = getRandomInt(0, 360, exept);
    return;
  }
  // Down -> Up
  if (this.direction > 0 && this.direction < 180) {
    this.direction = getRandomInt(180, 360);
    return;
  }
  // Up -> Down
  if (this.direction > 180) {
    this.direction = getRandomInt(0, 180);
  }
}

Firefly.prototype.update = function() {

  context.beginPath();

  context.fillStyle = this.color + this.alpha + ")";
  context.arc(this.x + (this.width / 2), this.y + (this.height / 2), this.width / 2, 0, 2 * Math.PI, false);
  context.shadowColor = this.color + this.alpha + ")";
  context.shadowBlur = this.shadowBlur;
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;
  context.fill();

  if (this.id > 30) {
    this.alpha -= this.alphaReduction;
    if (this.alpha <= 0) this.die();
  }

}

Firefly.prototype.die = function() {
  persons[this.id] = null;
  delete persons[this.id];
}

window.onload = function() {
  canvas.setAttribute('width', canvasWidth);
  canvas.setAttribute('height', canvasHeight);

  start();
}

function start() {
  instantiatePopulation();
  animate();
}

function instantiatePopulation() {
  var i = 0;
  while (i < numberOfFirefly) {
    persons[i] = new Firefly(i);
    i++;
  }
}

function animate() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  context.beginPath();

  // Création d'une copie de l'array persons
  persons_order = persons.slice(0);
  // Tri par ordre de position sur l'axe y (afin de gérer les z-index)
  persons_order.sort(function(a, b) {
    return a.y - b.y
  });

  // Paint les instances dans l'ordre trié
  for (var i in persons_order) {
    var u = persons_order[i].id;
    persons[u].walk();
  }

  requestAnimationFrame(animate);
}
