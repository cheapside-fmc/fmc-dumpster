function minMaxSplit(text) {
  if (text) {
    let output = text.split("-");
    if(output.length != 2) {
      output = [output, output];
    }
    return output;
  }
  else {
    return output = ["", ""];
  }
}

function restrictFormat(array) {
  let minSpeed = Number(array[1][0]);
  let maxSpeed = Number(array[1][1]);
  let minAlt = Number(array[2][0]);
  let maxAlt = Number(array[2][1]);
  let output = [array[0]];
  
  function speedAffix(speed) {
    if(Number(speed) <= 10) {
      return ["M",""];
    }
    else {
      return [""," KIAS"];
    }
  }

  function altAffix(alt) {
    if(Number(alt) < 18000) {
      return ["",alt," FT"];
    }
    else {
      let level = 5 * Math.round(alt/500);
      return ["FL",level,""]
    }
  }

  // Altitude
  if((minAlt != "") && (maxAlt != "")) {
    output.push(10 * Math.round( (minAlt + maxAlt)/20 ));
    if(minAlt == maxAlt) {
      console.log("a1e");
      output.push(`${altAffix(minAlt)[0] + altAffix(minAlt)[1] + altAffix(minAlt)[2]}`);
    }
    else {
      console.log("a1");
      output.push(`MIN ${altAffix(minAlt)[0] + altAffix(minAlt)[1] + altAffix(minAlt)[2]} MAX ${altAffix(maxAlt)[0] + altAffix(maxAlt)[1] + altAffix(maxAlt)[2]}`);
    }
  }
  else if((maxAlt != "") && (minAlt == "")) {
    console.log("a2");
    output.push(10 * Math.round(maxAlt/10));
    output.push(`MAX ${altAffix(maxAlt)[0] + altAffix(maxAlt)[1] + altAffix(maxAlt)[2]}`);
  }
  else if((minAlt != "") && (maxAlt == "")) {
    console.log("a3");
    output.push(10 * Math.round(maxAlt/10));
    output.push(`MIN ${altAffix(minAlt)[0] + altAffix(minAlt)[1] + altAffix(minAlt)[2]}`);
  }
  else {
    console.log("a4");
    output.push("");
    output.push("");
  }
  
  // Speed
  if((minSpeed != "") && (maxSpeed != "")) {
    if(minSpeed = maxSpeed) {
      console.log("s1e");
      output.push(`${speedAffix(minSpeed)[0] + minSpeed + speedAffix(minSpeed)[1]}`);
    }
    console.log("s1");
    output.push(`MIN ${speedAffix(minSpeed)[0] + minSpeed + speedAffix(minSpeed)[1]} MAX ${speedAffix(maxSpeed)[0] + maxSpeed + speedAffix(maxSpeed)[1]}`);
  }
  else if((maxSpeed != "") && (minSpeed == "")) {
    console.log("s2");
    output.push(`MAX ${speedAffix(maxSpeed)[0] + maxSpeed + speedAffix(maxSpeed)[1]}`);
  }
  else if((minSpeed != "") && (maxSpeed == "")) {
    console.log("s3");
    output.push(`MIN ${speedAffix(minSpeed)[0] + minSpeed + speedAffix(minSpeed)[1]}`);
  }
  else {
    console.log("s4");
    output.push("");
  }

  if(array[3]) {
    output.push(array[3]);
  }
  else {
    output.push("");
  }
  
  return output;
}

let routeInput = document.getElementById("route");

routeInput.addEventListener("change", () => {
  routeFile = routeInput.files;
  reader = new FileReader();
  reader.readAsText(routeFile[0]);
  reader.addEventListener("load", () => {
    route = reader.result;
    // Route loading finished

    // Adding route to page
    let routeShownInitial = document.createElement("p");
    routeShownInitial.textContent = route;
    document.body.appendChild(routeShownInitial);


    // Formatting route as arrays
    route = route.split("[[");
    let routeHead = route[0];
    let routeBody = route[1];
    routeHead = routeHead.slice(1, -1);
    routeBody = routeBody.slice(0, -3);
    routeHead = routeHead.split(",");
    routeBody = routeBody.split("],[");

    // Splitting waypoints into arrays
    let wpt = '';
    let wptNames = [];
    let rwyIndex = -1;
    for (let i = 0; i < routeBody.length; i++) {
      wpt = routeBody[i];
      wpt = wpt.split(",");

      // Waypoint name handling
      wpt[0] = wpt[0].replaceAll('\"', '');
      wptNames.push(wpt[0]);
      if (wpt[0].includes("RWY")) {
        rwyIndex = i;
      }

      wpt[1] = Number(wpt[1]);
      wpt[2] = Number(wpt[2]);
      wpt[3] = "null";
      wpt[4] = "false";
      wpt[5] = "null";

      routeBody[i] = wpt;
    }

    console.log(rwyIndex);
    console.log(routeBody);
    console.log(wptNames);
    console.log(routeHead);

    function getRouteData() {
      return [rwyIndex, routeBody, wptNames, routeHead];
    }

    // Creating restriction input
    restrictionInput = document.createElement('input');
    restrictionSubmit = document.createElement('button');
    restrictionSubmit.textContent = "sus";
    document.body.appendChild(restrictionInput);
    document.body.appendChild(restrictionSubmit);

    restrictionSubmit.addEventListener("click", () => {
      restriction = restrictionInput.value;
      restriction = restriction.split(" ");
      let wptIndex = -1;
      routeData = getRouteData();
      let finalRoute = routeData[1];

      for (let i = 0; i < restriction.length; i++) {
        wptIndex = -1;
        wptRestrict = restriction[i].split("/");

        // Putting restrictions in waypoints (ie what's the worst that could possibly happen)
        if(routeData[2].includes(wptRestrict[0])) {
          wptIndex = routeData[2].indexOf(wptRestrict[0]);

          wptRestrict[1] = wptRestrict[1].replace("K=", "");
          wptRestrict[2] = wptRestrict[2].replace("A=", "");
          wptRestrict[3] = wptRestrict[3].replace("N=", "");

          if(wptIndex == routeData[0]) {
            console.log(wptRestrict);
            finalRoute[wptIndex][3] = `${10 * Math.round(Number(wptRestrict[2]) / 10)}`;
            finalRoute[wptIndex][5] = `${wptRestrict[3]} ${wptRestrict[2]} FT`
          }
          else {
            
            // Formatting restrictions as arrays
            wptRestrict[1] = minMaxSplit(wptRestrict[1]);
            wptRestrict[2] = minMaxSplit(wptRestrict[2]);
            wptRestrict = restrictFormat(wptRestrict);
          
            if(wptRestrict[1]) {
              finalRoute[wptIndex][3] = `${wptRestrict[1]}`;
            }
  
            console.log(wptRestrict);
            
            // Sorting out spaces whyyyyyy
            if(wptRestrict[3] && wptRestrict[4]) {
              if(wptRestrict[2]) {
                finalRoute[wptIndex][5] = `${wptRestrict[2]} ${wptRestrict[3]} ${wptRestrict[4]}`;
                console.log("234");
              }
              else {
                finalRoute[wptIndex][5] = `${wptRestrict[3]} ${wptRestrict[4]}`;
                console.log("34");
              }
            }
            else if(wptRestrict[3]) {
              if(wptRestrict[2]) {
                finalRoute[wptIndex][5] = `${wptRestrict[2]} ${wptRestrict[3]}`;
                console.log("23");
              }
              else {
                finalRoute[wptIndex][5] = `${wptRestrict[3]}`;
                console.log("3");
              }
            }
            else if(wptRestrict[4]) {
              if(wptRestrict[2]) {
                finalRoute[wptIndex][5] = `${wptRestrict[2]} ${wptRestrict[4]}`;
                console.log("24");
              }
              else {
                finalRoute[wptIndex][5] = `${wptRestrict[4]}`;
                console.log("4");
              }
            }
            else {
              if(wptRestrict[2]) {
                finalRoute[wptIndex][5] = `${wptRestrict[2]}`;
                console.log("2");
              }
            }
          }
        }
      }
      // Restrictions finished

      // Creating route string
      let currentWaypoint = [];
      let finalRouteText = "";
      for(i = 0; i < finalRoute.length; i++) {
        currentWaypoint = finalRoute[i];
        currentWaypoint[0] = `\"${currentWaypoint[0]}\"`;
        currentWaypoint[1] = `${currentWaypoint[1]}`;
        currentWaypoint[2] = `${currentWaypoint[2]}`;
        if(currentWaypoint[3] != "null") {
          currentWaypoint[3] = `\"${currentWaypoint[3]}\"`
        }
        if(currentWaypoint[5] != "null") {
          currentWaypoint[5] = `\"${currentWaypoint[5]}\"`
        }
        finalRouteText = `${finalRouteText}[${currentWaypoint}],`;
      }

      finalRouteText = finalRouteText.slice(0, -1)
      finalRouteText = `[${routeData[3]},[${finalRouteText}]]`;
      let routeShownFinal = document.createElement("p");
      routeShownFinal.textContent = finalRouteText;
      document.body.appendChild(routeShownFinal);
      
      //Close restrictionSubmit listener
    });

    // Close route reader listener
  });

  // Close routeInput listener
});