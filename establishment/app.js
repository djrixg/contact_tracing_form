window.addEventListener('load', e=>{
	registerSW();	
});
async function registerSW(){
	if('serviceWorker' in navigator){
		// alert("Press Options and Click Add to Homescreen to use this even offline.");
		navigator.serviceWorker.register(".establishment/sw.js")
		.then((reg) => console.log("service worker registered\nReg:",reg.scope))
		.catch((err) => console.log("service worker not registered\nErr:",err));
	}
}

const cipher = salt => {
    const textToChars = text => text.split('').map(c => c.charCodeAt(0));
    const byteHex = n => ("0" + Number(n).toString(16)).substr(-2);
    const applySaltToChar = code => textToChars(salt).reduce((a,b) => a ^ b, code);

    return text => text.split('')
        .map(textToChars)
        .map(applySaltToChar)
        .map(byteHex)
        .join('');
}

const decipher = salt => {
    const textToChars = text => text.split('').map(c => c.charCodeAt(0));
    const applySaltToChar = code => textToChars(salt).reduce((a,b) => a ^ b, code);
    return encoded => encoded.match(/.{1,2}/g)
        .map(hex => parseInt(hex, 16))
        .map(applySaltToChar)
        .map(charCode => String.fromCharCode(charCode))
        .join('');
}
// const myCipher = cipher('mySecretSalt');
// const myDecipher = decipher('mySecretSalt');
// alert(myDecipher(myCipher('the secret string')));
    var db = openDatabase('CTracer_DB', '1.0', 'Contact Tracing List', 10 * 1024 * 1024);
    db.transaction(function (tx) {
      // tx.executeSql('DROP TABLE ctracer;');//DELETE THIS AFTER
      tx.executeSql('CREATE TABLE IF NOT EXISTS ctracer (data);');
    });

    function decodeOnce(codeReader, selectedDeviceId) {
      codeReader.decodeFromInputVideoDevice(selectedDeviceId, 'video').then((result) => {
        // document.getElementById('result').textContent = result.text
        // set_default_answers();
        process_result(result.text,true);
        //ADD DTI FORM HERE
        // alert(result);
        // $("#modal").modal("hide");
        // $("#dti").modal("show");
      }).catch((err) => {
        console.error(err)
        // document.getElementById('result').textContent = err
      })
    }

    function decodeContinuously(codeReader, selectedDeviceId) {
      codeReader.decodeFromInputVideoDeviceContinuously(selectedDeviceId, 'video', (result, err) => {
        if (result) {
          // document.getElementById('result').textContent = result.text
          process_result(result.text);
          alert(result.text);
        }
      })
    }
    let selectedDeviceId;
    const codeReader = new ZXing.BrowserQRCodeReader();
    window.addEventListener('load', function () {
      codeReader.getVideoInputDevices()
        .then((videoInputDevices) => {
          const sourceSelect = document.getElementById('sourceSelect')
          selectedDeviceId = videoInputDevices[0].deviceId
          if (videoInputDevices.length >= 1) {
            var c = 0
            videoInputDevices.forEach((element) => {
              const sourceOption = document.createElement('option')
              sourceOption.text = element.label;
              sourceOption.value = element.deviceId;
              if(c == 1){
                if(getMobileOperatingSystem()!="unknown"){
                  selectedDeviceId = videoInputDevices[1].deviceId;
                  sourceOption.selected = "selected";
                }
              }
              sourceSelect.appendChild(sourceOption);
              c++;
            })
            sourceSelect.onchange = () => {
              selectedDeviceId = sourceSelect.value;
            };

            const sourceSelectPanel = document.getElementById('sourceSelectPanel')
            sourceSelectPanel.style.display = 'block'
          }

          document.getElementById('startButton').addEventListener('click', () => {
              start_scan();
            // console.log(`Started decode from camera with id ${selectedDeviceId}`)
          })

          document.getElementById('resetButton').addEventListener('click', () => {
            codeReader.reset()
            document.getElementById('result').textContent = '';
            // console.log('Reset.')
          })

        })
        .catch((err) => {
          console.error(err)
        })
    });
function getMobileOperatingSystem() {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/windows phone/i.test(userAgent)) {
        return "Windows Phone";
    }
    if (/android/i.test(userAgent)) {
        return "Android";
    }
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return "iOS";
    }
    return "unknown";
}
function start_scan(){
    const decodingStyle = $('#decoding-style').val();
    if (decodingStyle == "once") {
      decodeOnce(codeReader, selectedDeviceId);
    } else {
      decodeContinuously(codeReader, selectedDeviceId);
    }
}
function get_answers(){
  var temp = {};
  for (var i = 1; i < 9; i++) {
    if($("input[name='q"+parseInt(i)+"']:checked").val()=="1"){
      temp["q"+parseInt(i)] = parseInt($("input[name='q"+parseInt(i)+"']:checked").val());
    }
  }
  temp_result_storage["dti"]=temp;
  // temp_result_storage["dti"]=JSON.stringify(temp);
  console.log(temp_result_storage);
  save_data(temp_result_storage);
}
function change_mode(){
  const decodingStyle = $('#decoding-style').val();
  if(decodingStyle == "once"){
    location.reload();
  }else{
    $("#temp").val("");
    scan_qr();
  }
}
function stop_scan(){
    codeReader.reset();
    $('#result').html = '';
}
function scan_qr(){
  start_scan();
  $("#modal").modal("show");
}
$('#modal').on('hidden.bs.modal', function () {
  // set_default_answers();
  $("#dti_submit").removeClass("d-none");
  if($('#decoding-style').val() == "once"){
    stop_scan();
  }else{
    location.reload();
    // stop_scan();
  }
});
function change(ch){
  if(ch!=null){
    if(ch=="."){
      if(!$('#temp').val().includes(".")){
        $('#temp').val($('#temp').val() + ch);
      } 
    }else{
      if(!isNaN(ch)){
        $('#temp').val($('#temp').val() + ch);
      }
    }
  }else{
    $('#temp').val($('#temp').val().slice(0, -1));
  }
}

$("#sourceSelect").change(function(){
  stop_scan();
  $("#modal").modal('hide');
  setTimeout(function(){ scan_qr(); }, 500);
});
function check(val){
  if(isNaN(val.val())){
    alert("Enter numbers ONLY!");
    val.val("");
  }
  val.on("keyup", function(event) {
    if (event.keyCode === 13) {
      scan_qr();
    }
  });
}
function cancel(){
      alert("Please generate a proper QR Code from http://tinyurl.com/universal-contact-tracing");
      $("#modal").modal('hide');
}
var temp_result_storage=null;
function process_result(result,solo=false){
  if(IsJsonString(result)){
    result = JSON.parse(result);
    if(!("firstName" in result)){
      cancel();
      return false;
    }
  }else{
    cancel();
    return false;
  }
  if(!solo){
    save_data(result);
  }else{
    // alert("SOLO");
    temp_result_storage = result;
    set_default_answers(result);
    $("#modal").modal("hide");
    $("#dti").modal("show");
  }
}
function save_data(result){
  result["datetime"] = new Date().toLocaleString();
  result["temperature"] = $("#temp").val();
  db.transaction(function (tx) {
    const myCipher = cipher('temp');
    var sql = 'INSERT INTO ctracer (data) VALUES ("'+myCipher(JSON.stringify(result))+'")';
    // console.log(sql);
    tx.executeSql(sql);
    $("#main_screen").prepend(`<div class="alert alert-success alert-dismissible fade show" role="alert" style="position: absolute;left: 28%;top: 4vh;z-index: 1;">
        `+result["firstName"]+" "+result["lastName"]+` added!
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>`);
    $("#temp").focus();
    $("#temp").val("");
    $("#dti").modal("hide");
    $(".alert-dismissible").fadeTo(2000, 500).slideUp(500, function(){
        $(".alert-dismissible").alert('close');
    });
  });
}
function clear_data(){
  // db.transaction(function (tx) {
  //   tx.executeSql('SELECT * FROM ctracer', [], function (tx, results) {
      if(confirm("Press okay to clear table")){
      db.transaction(function (tx) {
        tx.executeSql('DROP TABLE ctracer', [], function (tx, results) {
            alert("Data has been deleted!");
            location.reload();
        });
      });
      }
  //   });
  // });
}
function set_default_answers(result=null){
  var temp_date = new Date().toLocaleString();
  // console.log(temp_result_storage);
  var tt="";
  if(result!=null){
    tt=`<table class="table table-sm table-bordered">
          <tr>
            <td>Name</td>
            <th>`+result["firstName"]+` `+result["middleName"]+` `+result["lastName"]+`</th>
            <td>Date<br>Time</td>
            <th>`+temp_date+`</th>
          </tr>
          <tr>
            <td>Contact #</td>
            <th>`+result["contactNumber"]+`</th>
            <td>Temperature Reading</td>
            <th>`+$("#temp").val()+`°C</th>
          </tr>
          <tr>
            <td>Address</td>
            <th colspan="3">`+result["address"]+`, `+result["city"]+`, `+result["province"]+`</th>
          </tr>
        </table>`;
  }
  $("#dti_modal_body").html(tt+`<table class="table table-sm table-bordered">
          <tr>
            <th></th>
            <th>Yes</th>
            <th>No</th>
          </tr>
          <tr>
            <td>Are you experiencing:<br><span class="float-right">a. Sore throat</span></td>
            <td><label for="q1y"><input type="radio" name="q1" id="q1y" value="1"></label></td>
            <td><label for="q1n"><input type="radio" name="q1" id="q1n" value="0" checked></label></td>
          </tr>
          <tr>
            <td><span class="float-right">b. Body Pains</span></td>
            <td><label for="q2y"><input type="radio" name="q2" id="q2y" value="1"></label></td>
            <td><label for="q2n"><input type="radio" name="q2" id="q2n" value="0" checked></label></td>
          </tr>
          <tr>
            <td><span class="float-right">a. Headache</span></td>
            <td><label for="q3y"><input type="radio" name="q3" id="q3y" value="1"></label></td>
            <td><label for="q3n"><input type="radio" name="q3" id="q3n" value="0" checked></label></td>
          </tr>
          <tr>
            <td><span class="float-right">a. Fever</span></td>
            <td><label for="q4y"><input type="radio" name="q4" id="q4y" value="1"></label></td>
            <td><label for="q4n"><input type="radio" name="q4" id="q4n" value="0" checked></label></td>
          </tr>
          <tr>
            <td>Have you worked together or stayed in the same close environment of a confirmed COVID19 case?</td>
            <td><label for="q5y"><input type="radio" name="q5" id="q5y" value="1"></label></td>
            <td><label for="q5n"><input type="radio" name="q5" id="q5n" value="0" checked></label></td>
          </tr>
          <tr>
            <td>Have you had any contact with anyone with fever, cough, colds, and sore throat in the past 2 weeks?</td>
            <td><label for="q6y"><input type="radio" name="q6" id="q6y" value="1"></label></td>
            <td><label for="q6n"><input type="radio" name="q6" id="q6n" value="0" checked></label></td>
          </tr>
          <tr>
            <td>Have you travelled outside of the Philippines in the last 14 days?</td>
            <td><label for="q7y"><input type="radio" name="q7" id="q7y" value="1"></label></td>
            <td><label for="q7n"><input type="radio" name="q7" id="q7n" value="0" checked></label></td>
          </tr>
          <tr>
            <td>Have you travelled to any area in NCR or Metro Manila aside from your home?</td>
            <td><label for="q8y"><input type="radio" name="q8" id="q8y" value="1"></label></td>
            <td><label for="q8n"><input type="radio" name="q8" id="q8n" value="0" checked></label></td>
          </tr>
        </table>`);
}
function interpret_answers(results){
  set_default_answers();
  if(results!=""){
    results = results.split(",");
    $.each( results, function( i,v ){
      $("input[name="+v+"][value=1]").attr('checked', 'checked');
    });
  }
  $("#dti_submit").addClass("d-none");
  $("#dti").modal("show");
}
function history(){
  db.transaction(function (tx) {
    tx.executeSql('SELECT * FROM ctracer', [], function (tx, results) {
      $("#history_list").html("");
      var len = results.rows.length, i;
      $("#view_history").removeClass("d-none");
      $("#input_data").addClass("d-none");
      for (i = 0; i < len; i++) {
        const myDecipher = decipher('temp');
        data = myDecipher(results.rows.item(i).data);
        data = JSON.parse(data);
        var qq = [];
        if(data["dti"]!=null){
          qq = Object.keys(data["dti"]);
        }
        var temp_qq = "[";
        $.each( qq, function( i, l ){
          temp_qq+='"'+l+'"-';
        });
        temp_qq=temp_qq.slice(0,-1)+"]";
        var question = [];
        question[1]=' data-toggle="tooltip" data-placement="bottom" title="Sore throat"';
        question[2]=' data-toggle="tooltip" data-placement="bottom" title="Body Pains"';
        question[3]=' data-toggle="tooltip" data-placement="bottom" title="Headache"';
        question[4]=' data-toggle="tooltip" data-placement="bottom" title="Fever "';
        question[5]=' data-toggle="tooltip" data-placement="bottom" title="Worked together or stayed in the same close environment of a confirmed COVID19 case"';
        question[6]=' data-toggle="tooltip" data-placement="bottom" title="Had contact with someone with fever, cough, colds, and sore throat in the past 2 weeks"';
        question[7]=' data-toggle="tooltip" data-placement="bottom" title="Travelled outside of the Philippines in the last 14 days"';
        question[8]=' data-toggle="tooltip" data-placement="bottom" title="Travelled to any area in NCR or Metro Manila aside from home"';
        if(data["temperature"]!=""){data["temperature"] += "°C"}
        var temp = `<tr onclick="interpret_answers('`+qq+`')" class="btn-outline-dark">
                    <td>`+data["datetime"].replace(',','<br>')+`</td>
                    <td>`+data["firstName"]+" "+data["middleName"]+" "+data["lastName"]+`</td>
                    <td>`+data["temperature"]+`</td>
                    <td>`+data["contactNumber"]+`</td>
                    <td>`+data["address"]+`</td>
                    <td>`+data["city"]+`</td>
                    <td>`+data["province"]+`</td>`;
        for(var a=1;a<9;a++){
          if(qq.includes("q"+a.toString())){
            temp +="<td class='btn-success'"+question[a]+">✓</td>";
          }else{
            temp +="<td></td>";
          }
        }
        temp += `</tr>`;
        // temp += `<td><button class="btn btn-sm btn-outline-primary" onclick="interpret_answers('`+qq+`')"><small>`+temp_qq+`</small></button><br></td></tr>`;
        $("#history_list").append(temp);
      }
      $('[data-toggle="tooltip"]').tooltip();
      $("#history_modal").modal("show");
    });
  });
}
// function get_key(){
//   var key = "";
//   while(key==""){
//     key = prompt("You need to enter an encryption key to secure the data collected through this app to avoid hacking. Please backup the encryption key as this will be required everytime you access the saved data.Copy the typed key before pressing okay.\n\nEnter encryption key:");
//     if(key == null){
//       key="";
//     }
//   }
//   sessionStorage.setItem("temp_key", key);
//   alert("Without this key, you will never access the data collected from this device ever again. Please make sure to backup this key.\n\nEntered key: "+key);
// }


// if (typeof(Storage) !== "undefined") {
//   if(sessionStorage.getItem("temp_key")==null){
//     get_key();
//     history();
//   }
//   // sessionStorage.setItem("temp_key", "Test");
//   // if(sessionStorage.getItem("temp_key")!=null){
//   //   alert(sessionStorage.getItem("temp_key"));
//   // }
// } else {
//   alert("Sorry, your browser does not support Web Storage...");
// }
function IsJsonString(str) {
  try {
      JSON.parse(str);
  } catch (e) {
      return false;
  }
  return true;
}
$('#export').click(function() {
  var titles = [];
  var data = [];
  $('.dataTable th').each(function() {
    titles.push($(this).text());
  });
  $('.dataTable td').each(function() {
    data.push($(this).text());
  });
  var CSVString = prepCSVRow(titles, titles.length, '');
  CSVString = prepCSVRow(data, titles.length, CSVString);
  var downloadLink = document.createElement("a");
  var blob = new Blob(["\ufeff", CSVString]);
  var url = URL.createObjectURL(blob);
  downloadLink.href = url;
  downloadLink.download = "contact_tracing.csv";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
});
function prepCSVRow(arr, columnCount, initial) {
  var row = ''; // this will hold data
  var delimeter = ','; // data slice separator, in excel it's `;`, in usual CSv it's `,`
  var newLine = '\r\n'; // newline separator for CSV row
  function splitArray(_arr, _count) {
    var splitted = [];
    var result = [];
    _arr.forEach(function(item, idx) {
      if ((idx + 1) % _count === 0) {
        splitted.push(item);
        result.push(splitted);
        splitted = [];
      } else {
        splitted.push(item);
      }
    });
    return result;
  }
  var plainArr = splitArray(arr, columnCount);
  plainArr.forEach(function(arrItem) {
    arrItem.forEach(function(item, idx) {
      row += item + ((idx + 1) === arrItem.length ? '' : delimeter);
    });
    row += newLine;
  });
  return initial + row;
}