import React, { FC, useState } from 'react';
import './App.css';
import getWaveBlob from './helpers/wavBlobUtils';
var microOff = require('./resources/micro_off.png');
var microOn = require('./resources/micro_on.png');

var mediaRecorder : MediaRecorder | null;
var chunks: BlobPart[] | undefined = [];


const App : FC = () => {
  const [microImg, setMicroImg] = useState(microOff)

  var stream : MediaStream;
  let audioBlob : Blob;

  const onClickMicro = async () =>
  {
    if (!navigator.mediaDevices?.getUserMedia({audio: true, video: false}) && !navigator.mediaDevices) {
      return console.warn('Not supported')
    }
    if (microImg === microOff)
    {
      setMicroImg(microOn);
      try
      {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (e) =>
        {
          chunks?.push(e.data);
        }
        mediaRecorder.onstop = async () =>
        {
          audioBlob = new Blob(chunks, { type: "audio/webm" });
          const wavBlob = getWaveBlob(audioBlob, false);
          await saveRecord(await wavBlob);//await getWaveBlob(audioBlob, false, { sampleRate: 4000})
        }
        mediaRecorder.start();
      }
      catch(error)
      {
        console.error("error", error);
      }
    }
    else
    {
      mediaRecorder?.stop();
      
      setMicroImg(microOff);
      chunks = [];
      mediaRecorder = null;
    }
  }


  return (
    <div className="App">
      <h1>OK</h1>
      <img src={ microImg } alt="micro" onClick={onClickMicro}/>
    </div>
  );
}

const saveRecord = async (audioBlob : Blob) =>
{
  const formData = new FormData();
  let audioName = Date.now();
  formData.append("audio", audioBlob, audioName.toString());
  try
  {
    await fetch("http://localhost:8000/api/audio", 
      {
        method: "POST",
        body: formData
      }
    );
  }
  catch(e)
  {
    console.error(e);
  }
}

export default App;
