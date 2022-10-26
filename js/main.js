//Comienzo con el .JS


//Objeto productos : En extension .json

//Variables definidas, separadas por coma y taggeadas a las clases del HTML

const cartBtn = document.querySelector('.cart-btn'),
closeCartBtn = document.querySelector('.close-cart'),
clearCartBtn = document.querySelector('.clear-cart'),
cartDOM = document.querySelector('.cart'),
cartOverlay = document.querySelector('.cart-overlay'),
cartItems = document.querySelector('.cart-items'),
cartTotal = document.querySelector('.cart-total'),
cartContent = document.querySelector('.cart-content'),
productsDOM = document.querySelector('.products-center');

const btns = document.querySelectorAll('.bag-btn');


//Carrito  array
let cart = [];

//botones
let buttonsDOM = [];

//Generando los productos
class Products{
    async getProducts(){
        try{
            let result = await fetch('products.json');
            let data = await result.json();
            let products = data.items;
            products = products.map(item=>{
                const {title, price} = item.fields;
                const {id} = item.sys;
                const image = item.fields.image.fields.file.url;
                return{title, price, id, image};
            })
            return products;
            }catch{
            console.log(error);
        } 
    }
}

//Visualizacion de los productos

class UI{
    displayProducts(products){
    //console.log(products);
    let result = '';
    products.forEach(product => {
        result +=`
        <!-- Comienzo productos  -->
        <article class="product">
          <div class="img-container">
            <img
            //Agrego generico
              src=${product.image}
              alt="product"
              class="product-img"
            />
            <button class="bag-btn" data-id=${product.id}>
              <i class="fas fa-shopping-cart"></i>
              Agregar a Carrito
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$ ${product.price}</h4>
        </article>
        <!-- fin prudctos  -->
        `;
    });
    //Agrego el innerHTML para generar los productos
    productsDOM.innerHTML = result;
    }
    getBagButtons(){
        const buttons = [...document.querySelectorAll('.bag-btn')];
        buttonsDOM = buttons;
        buttons.forEach(button =>{
            let id = button.dataset.id;
            //console.log(id); chequeo l anumeracion del ID
            let inCart = cart.find(item => item.id === id);
            if(inCart){
                button.innerText = "En Carrito";
                button.disabled = true;
            }
            button.addEventListener('click', (event)=>{
                event.target.innerText = "En carrito";
                event.target.disabled = true;
                //Tomo productos de products
                let cartItem = {...Storage.getProduct(id), amount:1};
                //chequeo que funcione 
                //console.log(cartItem);

                //agrego productos al carrito
                cart = [...cart,cartItem];
                //compruebo que se agregue al carro
                //console.log(cart);

                //guardo la info en el localStorage
                Storage.saveCart(cart);

                //Asigno numero de productos a carrito
                this.setCartValues(cart);

                //enumeracion productos en carrito
                this.addCartItem(cartItem);
                //muestra carrito
                this.showCart();
            });
            
        });
    }
    
    //funcion carrito
    setCartValues(cart){
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item =>{
            tempTotal += item.price* item.amount;
            itemsTotal += item.amount;
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2))
        cartItems.innerText=itemsTotal;
        //compruebo que este funcionando por consola
        //console.log(cartTotal, cartItems);
    }

    addCartItem(item){
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
        <img src=${item.image} alt="product" />
        <div>
          <h4>${item.title}</h4>
          <h5>$${item.price}</h5>
          <span class="remove-item" data-id=${item.id}>remove</span>
        </div>
        <div>
          <i class="fas fa-chevron-up" data-id=${item.id}></i>
          <p class="item-amount">${item.amount}</p>
          <i class="fas fa-chevron-down" data-id=${item.id}></i>
        </div>
        `;
        cartContent.appendChild(div);
        //compruebo la composicion del innerHtml
        //console.log(cartContent);
    }

    showCart(){
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
    }
    
    setupAPP(){
        cart= Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart)
    }

    populateCart(cart){
        cart.forEach(item =>this.addCartItem(item));
    }

    hideCart(){
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }

    cartLogic(){
        //boton vaciar carrito
        clearCartBtn.addEventListener('click',()=>{
            this.clearCart();
        });
        //funcionalidad del carirto
        cartContent.addEventListener('click', event=>{
            //analizo por consola la calse del boton
            //console.log(event.target);
            
            if(event.target.classList.contains('remove-item')){
                let removeItem = event.target;
                //analizo boton de eliminar
                //console.log(removeItem);
                let id = removeItem.dataset.id;
                //verifico la ruta del boton eliminar para usar luego en el removechild
                //console.log(removeItem.parentElement.parentElement);
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            }else if(event.target.classList.contains('fa-chevron-up')){
                let addAmount = event.target;
                let id =addAmount.dataset.id;
                //verifico por consola
                //console.log(addAmount);
                //Defino variable y operacion de suma
                let tempItem = cart.find(item=> item.id===id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;  
                
                //ahora voy por la resta
            }else if(event.target.classList.contains('fa-chevron-down')){
                let lowerAmount=event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id ===id);
                tempItem.amount=tempItem.amount -1;
                if(tempItem.amount>0){
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                }else{
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
            }
        });
    }
    
    clearCart(){
        let cartItems = cart.map(item => item.id);
        //ciclo para limpiar los elementos del array carrito
        cartItems.forEach(id => this.removeItem(id));
        console.log(cartContent.children);
        while (cartContent.children.length>0){
            cartContent.removeChild(cartContent.children[0])
        }
        this.hideCart();
    }

    removeItem(id){
        cart = cart.filter(item => item.id !==id)
        this.setCartValues(cart);
        Storage.saveCart(cart);
        //habilitar leyenda sobre productos para agregar
        let button = this.getSingleButton(id);
        button.disabled= false;
        button.innerHTML= `<i class="fas fa-shopping-cart"></i>add to cart `
    }

    getSingleButton(id){
        return buttonsDOM.find(button =>button.dataset.id ===id);
    }
}

//Guardado local 

class Storage{
    static saveProducts(products){
        localStorage.setItem('products', JSON.stringify(products));
    }
    static getProduct(id){
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id)
    }
    static saveCart(){
        localStorage.setItem('cart',JSON.stringify(cart));
    }
    static getCart(){
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[]
    }
}

//Agregamos las funcionalidades a los botones
document.addEventListener("DOMContentLoaded", ()=>{
    const ui = new UI();
    const products = new Products();
    //configuracion app
    ui.setupAPP();
    //Todos los productos
    products.getProducts().then(products=> {
        ui.displayProducts(products);
        Storage.saveProducts(products);
        }).then(()=>{
            ui.getBagButtons();
            ui.cartLogic()
        });
    }
);



