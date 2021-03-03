import React, {useEffect, useState} from 'react';
import axios from "axios";
import {Carousel} from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
function App() {
  const [allPhotos, setAllPhotos] = useState([]);
  const fetchPhotos = async () => {
    const {data} = await axios.get(`${baseUri}/photos`);
    setAllPhotos(data);
  };
  const getImage = (photo: any) => {
    return (
      <Carousel.Item interval={1000}>
        <img src={photo.url} alt={photo.filename}/>
        <Carousel.Caption>
          <h3>{photo.filename}</h3>
        </Carousel.Caption>
      </Carousel.Item>
    )
  };

  useEffect(() => {
    fetchPhotos()
  });
  const baseUri:string = process.env.REACT_APP_API_URL!;

  return (
    <div className="App">
      <Carousel>
        {
          allPhotos.map(photo => getImage(photo))
        }
      </Carousel>
    </div>
  );
}

export default App;
