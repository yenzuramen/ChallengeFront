import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";
import '../src/styles.css';

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [parentBounds, setparentBounds] = useState(null)

  const parentRef = useRef(null) //Ref for parent div

  useEffect(() => { //Setting boundaries of parent div
    const parentBounds = parentRef.current.getBoundingClientRect();
    // console.log(parentBounds);
    setparentBounds(parentBounds)
  }, [])


  //Returning image for each component 
  const getImage = async (imageNumber) => {
    const request = await fetch('https://jsonplaceholder.typicode.com/photos/' + imageNumber, {
      method: "GET"
    })
    const data = await request.json();
    return data.thumbnailUrl;
  }

  const addMoveable = async () => {
    // Create a new moveable component and add it to the array
    const COLORS = ["red", "blue", "yellow", "green", "purple"];

    const imageNumber = moveableComponents.length + 1;

    let imageUrl = await getImage(imageNumber);
    // console.log(imageUrl);

    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        updateEnd: true,
        imageUrl
      },
    ]);
  };

  const updateMoveable = (id, newComponent, updateEnd = false) => {

    //Passes all moveables on the list, only updates the one selected. 
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        // console.log(newComponent);

        //Restricting draggin outside parent 
        if (newComponent.top < 0) { //Top
          newComponent.top = 0;
        }
        if (newComponent.left < 0) { //Left
          newComponent.left = 0;
        }

        if ((newComponent.top + newComponent.height) >= parentBounds.height) { //Bottom
          console.log();
          newComponent.top = parentBounds.height - newComponent.height;
        }

        if ((newComponent.left + newComponent.width) >= parentBounds.width) { //Rigth
          newComponent.left = parentBounds.width - newComponent.width;
        }



        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);


  };

  const handleResizeStart = (index, e) => {
    console.log("e", e.direction);
    // Check if the resize is coming from the left handle
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosX === -1) {
      console.log("width", moveableComponents, e);
      // Save the initial left and width values of the moveable component
      const initialLeft = e.left;
      const initialWidth = e.width;

      // Set up the onResize event handler to update the left value based on the change in width
    }
  };

  //Deletes selected moveable 
  const deleteMoveable = () => {
    setMoveableComponents(moveableComponents.filter(moveable => moveable.id !== selected))
  }

  return (
    <main style={{ height: "100vh", width: "100vw" }}>
      <div className="btn_container">
        <button className="add_btn" onClick={addMoveable}>Add Moveable</button>
        {/* Delete Button */}
        {moveableComponents.length > 0 &&
          <button className="del_btn" onClick={deleteMoveable}>Delete Selected</button>}

      </div>

      <div
        id="parent"
        ref={parentRef}
        style={{
          position: "relative",
          background: "black",
          height: "80vh",
          width: "80vw",
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item} //Destructuring element properties 
            key={index}
            updateMoveable={updateMoveable}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected}
            isSelected={selected === item.id}
            parentBounds={parentBounds}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  color,
  id,
  setSelected,
  isSelected = false,
  updateEnd,
  imageUrl, //Getting ImageUrl
  parentBounds //Getting boundaries
}) => {
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    id,
  });

  let parent = document.getElementById("parent");
  // let parentBounds = parent?.getBoundingClientRect();

  const onResize = async (e, imageUrl) => {

    console.log(e);
    // ACTUALIZAR ALTO Y ANCHO
    let newWidth = e.width;
    let newHeight = e.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    // console.log(positionMaxLeft);
    // console.log(newWidth);
    // console.log(left
    // );
    // console.log(parentBounds.width);

    // if (positionMaxTop > parentBounds?.height)
    //   newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds.width) { //right 
      newWidth = parentBounds.width - left;
    }


    // if (positionMaxTop > parentBounds?.height)
    //   newHeight = parentBounds?.height - top;
    // if (positionMaxLeft > parentBounds?.width)
    //   newWidth = parentBounds?.width - left;

    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      color,
      imageUrl
    });

    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
    });
  };

  const onResizeEnd = async (e) => {
    // console.log('resize end');
    // let newWidth = e.lastEvent?.width;
    // let newHeight = e.lastEvent?.height;

    // const positionMaxTop = top + newHeight;
    // const positionMaxLeft = left + newWidth;

    // if (positionMaxTop > parentBounds?.height)
    //   newHeight = parentBounds?.height - top;
    // if (positionMaxLeft > parentBounds?.width)
    //   newWidth = parentBounds?.width - left;

    // const { lastEvent } = e;
    // const { drag } = lastEvent;
    // const { beforeTranslate } = drag;

    // const absoluteTop = top + beforeTranslate[1];
    // const absoluteLeft = left + beforeTranslate[0];

    // updateMoveable(
    //   id,
    //   {
    //     top: absoluteTop,
    //     left: absoluteLeft,
    //     width: newWidth,
    //     height: newHeight,
    //     color,
    //   },
    //   true
    // );
  };

  return (
    <>
      <div
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          background: color,
        }}
        onClick={() => setSelected(id)}
      >
        <img src={imageUrl} className='overlay' />
      </div>

      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        onDrag={(e) => {
          updateMoveable(id, {
            top: e.top,
            left: e.left,
            width,
            height,
            color,
            imageUrl //passing imageurl
          });
        }}
        onResize={(e) => onResize(e, imageUrl)}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
    </>
  );
};
