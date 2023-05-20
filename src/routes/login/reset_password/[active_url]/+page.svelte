<script lang="ts">
    // Import page for active_url
    import { page } from '$app/stores';

    // Import components
    // import Topbar from "../../../../components/Topbar.svelte";
    import { apiFetch } from "../../../../fetch/apiFetch";

    let passwordInput = "";
    let password2Input = "";
    
    // Regex Expressions
    const uppercaseRegex = new RegExp('^(?=.*?[A-Z])'); // >= 1 uppercase English charcter: (?=.*?[A-Z])
    const lowercaseRegex = new RegExp('^(?=.*?[a-z])'); // >= 1 lowecase English character: (?=.*?[a-z])
    const numberRegex = new RegExp('^(?=.*?[0-9])');  // >= 1 digit: (?=.*?[0-9])
    const specialCharRegex = new RegExp('(?=.*?[#?!@$%^&*-])');  // >= 1 special character (?=.*?[#?!@$%^&*-])

    // Tooltips
    $: lowercaseTipColor = "red";
    $: uppercaseTipColor = "red";
    $: integerTipColor = "red";
    $: specialTipColor = "red";
    $: lengthTipColor = "red";
    $: matchingTipColor = "red";
    
    function checkPassword() {
        if (lowercaseRegex.test(passwordInput)) {
            lowercaseTipColor = "green";
        } else {
            lowercaseTipColor = "red";
        }

        if (uppercaseRegex.test(passwordInput)) {
            uppercaseTipColor = "green";
        } else {
            uppercaseTipColor = "red";
        }

        if (numberRegex.test(passwordInput)) {
            integerTipColor = "green";
        } else {
            integerTipColor = "red";
        }

        if (specialCharRegex.test(passwordInput)) {
            specialTipColor = "green";
        } else {
            specialTipColor = "red";
        }

        if (passwordInput.length >= 8) {
            lengthTipColor = "green";
        } else {
            lengthTipColor = "red";
        }

        if (password2Input === passwordInput
            && passwordInput != ""
        ) {
            matchingTipColor = "green";
        } else {
            matchingTipColor = "red";
        }
    }
  
    async function handleSubmit() {
        if (
            !lowercaseRegex.test(passwordInput)
            || !uppercaseRegex.test(passwordInput)
            || !numberRegex.test(passwordInput)
            || !specialCharRegex.test(passwordInput)
            || !(passwordInput.length >= 8)
            ) {
            alert("Password must meet requirements.")
            return;
        }

        if (passwordInput !== password2Input) {
            alert("Passwords do not match.")
            return;
        }
    
        const data = {
            "active_url": $page.params.active_url,
            "password": passwordInput,
        }
    
        try {
            const options: any = {
            method: 'POST',
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
            body: data
            };
    
            const response = await apiFetch('/change_password/', options, true);
            if (response.status === 200) {
                alert("Your password has been changed.")
            } else if (response.status === 409) {
                alert('invalid reset url')
            }
        } catch (error){
            console.log(error);
        }
    }
</script>
  
  <!-- <Topbar></Topbar> -->
  <h1>Request Password Reset</h1>
  <section class="input-container">
    <ul>
        <p>Password rules</p>
        <li id="lowercase-tip" style="color: {lowercaseTipColor};">At least 1 lowercase character</li>
        <li id="uppercase-tip" style="color: {uppercaseTipColor};">At least 1 uppercase character</li>
        <li id="integer-tip" style="color: {integerTipColor};">At least 1 number</li>
        <li id="special-tip" style="color: {specialTipColor};">At least 1 special character</li>
        <li id="length-tip" style="color: {lengthTipColor};">At least 8 characters in length</li>
        <li id="matching-tip" style="color: {matchingTipColor};">Password match</li>
    </ul>
        <input id="password" placeholder="Password" bind:value={passwordInput} on:input={checkPassword} type="password"/>
        <input id="password2" placeholder="Re-enter Password" bind:value={password2Input} on:input={checkPassword} type="password"/>
    <p></p>
    <button on:click={handleSubmit}>Submit</button>
  </section>
  
  <style>
    h1{
      text-align: center;
      margin: auto;
    }
  
    .input-container{
      margin: auto;
      max-width: 200px;
      display: grid;
    }
  </style>
  
  