// simulate getting products from DataBase
var products = [
  { name: "Apples_:", country: "Italy", cost: 3, instock: 10 },
  { name: "Oranges:", country: "Spain", cost: 4, instock: 3 },
  { name: "Beans__:", country: "USA", cost: 2, instock: 5 },
  { name: "Cabbage:", country: "USA", cost: 1, instock: 8 },
];

var getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

const imgSeeds = [getRandomInt(1,1000), getRandomInt(1,1000),getRandomInt(1,1000),getRandomInt(1,1000)]



// var products = [...products]
//=========Cart=============
const Cart = (props) => {
  const { Card, Accordion, Button } = ReactBootstrap;
  let data = props.location.data ? props.location.data : products;
  console.log(`data:${JSON.stringify(data)}`);

  return <Accordion defaultActiveKey="0">{list}</Accordion>;
};

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
  console.log(`useDataApi called`);
  useEffect(() => {
    console.log("useEffect Called");
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        console.log("FETCH FROM URl");
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

var cartMapping = []      //item index in cart maps to item index in product list

const Products = (props) => {
  const [items, setItems] = React.useState(products);
  const [cart, setCart] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const {Card, Accordion, Button, Container, Row, Col, Image, Input} = ReactBootstrap;

  //  Fetch Data
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("http://localhost:1337/products");
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://localhost:1337/products",
    {  data: [], }
  );
  console.log(`Rendering Products ${JSON.stringify(data)}`);

  

  const updateTempStock = (idx,op) =>{
    if(op=="remove") {
      if(items[idx].instock==0) return;
      --items[idx].instock;
    }
    else if(op=="add") ++items[idx].instock;
  }


  // Fetch Data
  const addToCart = (e) => {
    let name = e.target.name;
    let item = items.filter((item) => item.name == name);
    console.log(`add to Cart ${JSON.stringify(item)}`);
  
    var listItems = e.target.parentNode.parentNode.getElementsByTagName("li");
    var idx = 0;
    for(let i=0; i < listItems.length; ++i) {
      console.log("listItems[i].childNodes[0]", listItems[i].children[2])
      if(listItems[i].children[2]==e.target) {
        idx=i;
        break;
      }
    }
    
    if(items[idx].instock==0) return
    cartMapping.push(idx)
    setCart([...cart, ...item]);
    updateTempStock(idx,"remove")
    doFetch(query);
  };

  const deleteCartItem = (index) => {

    updateTempStock(cartMapping[index],"add")
    cartMapping.splice(index,1)
    let newCart = cart.filter((item, i) => index != i);
    setCart(newCart);
  };


  let list = items.map((item, index) => {
    let url = "https://picsum.photos/seed/" + imgSeeds[index] + "/50/50";
    return (
      <li key={index}>
        <Image src={url} width={70} roundedCircle></Image>
        <Button variant="primary" size="large">{item.name}:${item.cost}-Stock={item.instock}</Button>
        <input name={item.name} type="submit" onClick={(e)=>{addToCart(e)}}></input>
      </li>
    );
  });


  let cartList = cart.map((item, index) => {
    return (
      <Card key={index}>
        <Card.Header>
          <Accordion.Toggle as={Button} variant="link" eventKey={1 + index}>{item.name}</Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse onClick={() => deleteCartItem(index)} eventKey={1 + index}>
          <Card.Body>$ {item.cost} from {item.country}</Card.Body>
        </Accordion.Collapse>
      </Card>
    );
  });


  let finalList = () => {
    let total = checkOut();
    let final = cart.map((item, index) => {
      return (<div key={index} index={index}>{item.name}</div>);
    });
    return { final, total };
  };


  const checkOut = () => {
    let costs = cart.map((item) => item.cost);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    console.log(`total updated to ${newTotal}`);
    return newTotal;
  };



  // TODO: implement the restockProducts function
  const restockProducts = (url) => {
    doFetch(url);
    let newItems = data.map((item)=> {
      let {name,country,cost,instock} = item;
      return {name, country, cost, instock};
    })
    setItems([...items,...newItems]);
    
  };


  return (
    <Container>
      <Row>
        <Col>
          <h1>Product List</h1>
          <ul style={{ listStyleType: "none" }}>{list}</ul>
        </Col>
        <Col>
          <h1>Cart Contents</h1>
          <Accordion>{cartList}</Accordion>
        </Col>
        <Col>
          <h1>CheckOut </h1>
          <Button onClick={checkOut}>CheckOut $ {finalList().total}</Button>
          <div> {finalList().total > 0 && finalList().final} </div>
        </Col>
      </Row>
      <Row>
        <form
          onSubmit={(event) => {
            restockProducts(`http://localhost:1337/${query}`);
            console.log(`Restock called on ${query}`);
            event.preventDefault();
          }}
        >
          <input type="text" value={query} onChange={(event) => setQuery(event.target.value)}/>
          <button type="submit">ReStock Products</button>
        </form>
      </Row>
    </Container>
  );
};
// ========================================
ReactDOM.render(<Products />, document.getElementById("root"));
