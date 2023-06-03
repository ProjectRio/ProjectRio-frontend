<script>
    /**
   * @type {number}
   */
     export let firstBase;
    /**
   * @type {number}
   */
     export let secondBase;
    /**
   * @type {number}
   */
     export let thirdBase;
 
    import { afterUpdate, onMount } from 'svelte';
 
    /**
   * @type {HTMLLIElement}
   */
    let firstBaseElement;
    /**
   * @type {HTMLLIElement}
   */
    let secondBaseElement;
    /**
   * @type {HTMLLIElement}
   */
    let thirdBaseElement;
 
    onMount(() => {
        updateBaseClasses();
    });
 
    afterUpdate(() => {
        updateBaseClasses();
    });
 
    function updateBaseClasses() {
        if (firstBaseElement) {
            if (firstBase === 0) {
                firstBaseElement.classList.add('no-runners');
            } else {
                firstBaseElement.classList.remove('no-runners');
            }
        }
 
        if (secondBaseElement) {
            if (secondBase === 0) {
                secondBaseElement.classList.add('no-runners');
            } else {
                secondBaseElement.classList.remove('no-runners');
            }
        }
 
        if (thirdBaseElement) {
            if (thirdBase === 0) {
                thirdBaseElement.classList.add('no-runners');
            } else {
                thirdBaseElement.classList.remove('no-runners');
            }
        }
    }
</script>
 
<!-- Rest of the HTML code remains the same -->

 
 <div class="container">
     <h3>On Base</h3>
     <ul id="bases">
         <li id="home-plate" style="display: none;">Home Plate</li>
         <li id="first-base" bind:this={firstBaseElement} class:no-runners={firstBase === 0}>First Base <span>{firstBase}</span></li>
         <li id="second-base" bind:this={secondBaseElement} class:no-runners={secondBase === 0}>Second Base <span>{secondBase}</span></li>
         <li id="third-base" bind:this={thirdBaseElement} class:no-runners={thirdBase === 0}>Third Base <span>{thirdBase}</span></li>
     </ul>
 </div>
 
<style>
ul{
padding: 0;
margin: 0;
}

ul li{
    list-style-type: none;
  }

/* .container{
  background-color: #000;
  position: relative;
  box-shadow: 0px 5px 15px 0px rgba(0,0,0,0.5);
  width: 40rem;
  width: 640px;
  margin: 100px auto;
  padding: 0.2rem;
  color: #fff;
  border-radius: 1.7rem 1.7rem 3rem 3rem;
  height: 150px;
} */

.container {
    max-width: 100%;
}

h3{
    display: none;
  }

#bases{
    position: absolute;
    border: 5px solid #eee;
    box-sizing: border-box;
    height: 82px;
    width: 82px;
    display: block;
    transform: rotate(45deg);
    background-color: #333;
    box-shadow: 0 0 5px rgba(0,0,0,0.3);
    border-radius: 10px;
    top: 16px;
    left: 50%;
    margin-left: -43px;
}

#first-base.no-runners, #second-base.no-runners, #third-base.no-runners {
    background: #606060;
    box-shadow: inset 1px 0px 2px #000;
    border-right: 1px solid #777;
}

#first-base,
    #second-base,
    #third-base{
    width: 25px;
    height: 25px;
    position: absolute;
    background: radial-gradient(ellipse at 40% 90%, rgba(255,192,0,1) 0%,rgba(236,241,0,1) 100%); /* W3C */
    border-radius: 5px;
    }

#first-base{
right: 6px;
top: 6px;
text-indent: -99em;
color: transparent;
}

#second-base{
left: 6px;
top: 6px;
width: 24px;
text-indent: -99em;
color: transparent;
/* background: #606060; */
/* box-shadow: inset 1px 0px 2px #000; */
/* border-right: 1px solid #777; */
}

#third-base{
left: 6px;
bottom: 6px;
text-indent: -99em;
color: transparent;
}

#home-plate {
top: 36px;
left: 42px;
transform: rotate(-225deg);
display: block !important;
text-indent: -99em;
color: transparent;
position: absolute;
border-radius: 3px;
width: 14px;
border-width: 9px 0px 0;
border-style: solid;
border-color: #ccc transparent;
}

#home-plate:before {
content: "";
position: absolute;
height: 0;
width: 0;
top: -13px;
left: 0px;
border-width: 0 7px 5px;
border-style: solid;
border-color: transparent transparent #ccc;
}
    
</style>