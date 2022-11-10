//Comienzo con el .JS

//Objeto productos : En extension .json

//Variables definidas, separadas por coma y taggeadas a las clases del HTML
const carritoBtn = document.querySelector('.carrito-btn'),
closeCarritoBtn = document.querySelector('.close-carrito'),
limpiarCarritoBtn = document.querySelector('.limpiar-carrito'),
carritoDOM = document.querySelector('.carrito'),
carritoSup = document.querySelector('.carrito-sup'),
carritoItems = document.querySelector('.carrito-items'),
carritoTotal = document.querySelector('.carrito-total'),
carritoContent = document.querySelector('.carrito-content'),
productosDOM = document.querySelector('.productos-central'),
btnCentral = document.querySelector('.banner-btn'),
contactoMensaje = document.querySelector('.contacto');

const btns = document.querySelectorAll('.bag-btn');


//Carrito  array
let carrito = [];

//botones
let buttonsDOM = [];

//Generando los productos
class Productos{
    async getProductos(){
        try{
            let result = await fetch('products.json');
            let data = await result.json();
            let productos = data.items;
            productos = productos.map(item=>{
                const {articulo, precio} = item.campos;
                const {id} = item.sys;
                const imagen = item.campos.imagen.campos.file.url;
                return{articulo, precio, id, imagen};
            })
            return productos;
            }catch{
            console.log(error);
        } 
    }
}

//Visualizacion de los productos en carrito

class UI{
    displayProductos(productos){
    //console.log(productos);
    let result = '';
    productos.forEach(producto => {
        result +=`
        <!-- Comienzo productos  -->
        <article class="producto">
          <div class="img-container">
            <img
            //Agrego generico
              src=${producto.imagen}
              alt="producto"
              class="productos-img"
            />
            <button class="bag-btn" data-id=${producto.id}>
              <i class="fas fa-shopping-cart"></i>
              Agregar a Carrito
            </button>
          </div>
          <h3>${producto.articulo}</h3>
          <h4>$ ${producto.precio}</h4>
        </article>
        <!-- fin prudctos  -->
        `;
    });
    //Agrego el innerHTML para generar los productos
    productosDOM.innerHTML = result;
    }
    getBagButtons(){
        const buttons = [...document.querySelectorAll('.bag-btn')];
        buttonsDOM = buttons;
        buttons.forEach(button =>{
            let id = button.dataset.id;
            //console.log(id); chequeo l anumeracion del ID
            let enCarrito = carrito.find(item => item.id === id);
            if(enCarrito){
                button.innerText = "En Carrito";
                button.disabled = true;
            }
            button.addEventListener('click', (event)=>{
                event.target.innerText = "En carrito";
                event.target.disabled = true;
                //Tomo productos de productos
                let carritoItem = {...Storage.getProducto(id), amount:1};
                //chequeo que funcione 
                //console.log(carritoItem);

                //agrego productos al carrito
                carrito = [...carrito,carritoItem];
                //compruebo que se agregue al carro
                //console.log(carrito);

                //guardo la info en el localStorage
                Storage.saveCarrito(carrito);

                //Asigno numero de productos a carrito
                this.setCarritoValues(carrito);

                //enumeracion productos en carrito
                this.addCarritoItem(carritoItem);
                //muestra carrito
                this.showCarrito();
            });
            
        });
    }
    
    //funcion dentro de carrito cantidades
    setCarritoValues(carrito){
        let tempTotal = 0;
        let itemsTotal = 0;
        carrito.map(item =>{
            tempTotal += item.precio* item.amount;
            itemsTotal += item.amount;
        })
        carritoTotal.innerText = parseFloat(tempTotal.toFixed(2))
        carritoItems.innerText=itemsTotal;
        //compruebo que este funcionando por consola
        //console.log(carritoTotal, carritoItems);
    }

    addCarritoItem(item){
        const div = document.createElement('div');
        div.classList.add('carrito-item');
        div.innerHTML = `
        <img src=${item.imagen} alt="producto" />
        <div>
          <h4>${item.articulo}</h4>
          <h5>$${item.precio}</h5>
          <span class="remove-item" data-id=${item.id}>remove</span>
        </div>
        <div>
          <i class="fas fa-chevron-up" data-id=${item.id}></i>
          <p class="item-amount">${item.amount}</p>
          <i class="fas fa-chevron-down" data-id=${item.id}></i>
        </div>
        `;
        carritoContent.appendChild(div);
        //compruebo la composicion del innerHtml
        //console.log(carritoContent);
    }

    showCarrito(){
        carritoSup.classList.add('transparentBcg');
        carritoDOM.classList.add('mostrarCarrito');
    }
    
    setupAPP(){
        carrito= Storage.getCarrito();
        this.setCarritoValues(carrito);
        this.populateCarrito(carrito);
        carritoBtn.addEventListener('click', this.showCarrito);
        closeCarritoBtn.addEventListener('click', this.hideCarrito)
    }

    populateCarrito(carrito){
        carrito.forEach(item =>this.addCarritoItem(item));
    }

    hideCarrito(){
        carritoSup.classList.remove('transparentBcg');
        carritoDOM.classList.remove('mostrarCarrito');
    }

    carritoLogic(){
        //boton vaciar carrito
        limpiarCarritoBtn.addEventListener('click',()=>{
            this.limpiarCarrito();
        });
        //funcionalidad del carirto
        carritoContent.addEventListener('click', event=>{
            //analizo por consola la calse del boton
            //console.log(event.target);
            
            if(event.target.classList.contains('remove-item')){
                let removeItem = event.target;
                //analizo boton de eliminar
                //console.log(removeItem);
                let id = removeItem.dataset.id;
                //verifico la ruta del boton eliminar para usar luego en el removechild
                //console.log(removeItem.parentElement.parentElement);
                carritoContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            }else if(event.target.classList.contains('fa-chevron-up')){
                let addAmount = event.target;
                let id =addAmount.dataset.id;
                //verifico por consola
                //console.log(addAmount);
                //Defino variable y operacion de suma
                let tempItem = carrito.find(item=> item.id===id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCarrito(carrito);
                this.setCarritoValues(carrito);
                addAmount.nextElementSibling.innerText = tempItem.amount;  
                
                //ahora voy por la resta
            }else if(event.target.classList.contains('fa-chevron-down')){
                let lowerAmount=event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = carrito.find(item => item.id ===id);
                tempItem.amount=tempItem.amount -1;
                if(tempItem.amount>0){
                    Storage.saveCarrito(carrito);
                    this.setCarritoValues(carrito);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                }else{
                    carritoContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
            }
        });
    }
    
    limpiarCarrito(){
        let carritoItems = carrito.map(item => item.id);
        //ciclo para limpiar los elementos del array carrito
        carritoItems.forEach(id => this.removeItem(id));
        console.log(carritoContent.children);
        while (carritoContent.children.length>0){
            carritoContent.removeChild(carritoContent.children[0])
        }
        this.hideCarrito();
    }

    removeItem(id){
        carrito = carrito.filter(item => item.id !==id)
        this.setCarritoValues(carrito);
        Storage.saveCarrito(carrito);
        //habilitar leyenda sobre productos para agregar
        let button = this.getSingleButton(id);
        button.disabled= false;
        button.innerHTML= `<i class="fas fa-shopping-carrito"></i>Agregar a carrito `
    }

    getSingleButton(id){
        return buttonsDOM.find(button =>button.dataset.id ===id);
    }
}

//Guardado local 

class Storage{
    static guardarProductos(productos){
        localStorage.setItem('productos', JSON.stringify(productos));
    }
    static getProducto(id){
        let productos = JSON.parse(localStorage.getItem('productos'));
        return productos.find(productos => productos.id === id)
    }
    static saveCarrito(){
        localStorage.setItem('carrito',JSON.stringify(carrito));
    }
    static getCarrito(){
        return localStorage.getItem('carrito')?JSON.parse(localStorage.getItem('carrito')):[]
    }
}

//Agregamos las funcionalidades a los botones
document.addEventListener("DOMContentLoaded", ()=>{
    const ui = new UI();
    const productos = new Productos();
    //configuracion app
    ui.setupAPP();
    //Todos los productos
    productos.getProductos().then(productos=> {
        ui.displayProductos(productos);
        Storage.guardarProductos(productos);
        }).then(()=>{
            ui.getBagButtons();
            ui.carritoLogic()
        });
    }
);

//Aplicacion libreria SweetAlert
btnCentral.addEventListener("click", ()=>{
      Swal.fire({
        icon: 'error',
        title: 'Oops...Pagina en estado de midicion',
        text: 'Disculpe las molestias',
        footer: '<a href="">Chatea con nosotros</a>'
    })
});

contactoMensaje.addEventListener("click", ()=>{
  	
    (async () => {

        const { value: text } = await Swal.fire({
          input: 'textarea',
          inputLabel: 'Mensaje/Comentario/Medida',
          inputPlaceholder: 'Escriba aqui lo que quiera...',
          inputAttributes: {
            'aria-label': 'Escriba aqui lo que quiera'
          },
          showCancelButton: true
        })
        
        if (text) {
          Swal.fire(text)
        }
        
        })()
});
