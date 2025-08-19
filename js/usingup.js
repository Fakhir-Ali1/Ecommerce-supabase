const supabaseUrl = 'https://sdwhmvkylqoqgfwqherf.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkd2htdmt5bHFvcWdmd3FoZXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzIwNDgsImV4cCI6MjA3MDc0ODA0OH0.XVVIi60ktD6grXfBmv0Eccn_eXZbX9vyhrRwlt3bAAM";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

document.getElementById("usingup").addEventListener("click",async()=>{
let email = document.getElementById('SEmail').value
let pass = document.getElementById('SPass').value
const { data, error } = await supabase.auth.signUp({
  email: email,
  password: pass,
})
email = ""
pass = " "
if (error){
    console.log("error",error)
}
else{
    location.href= "./login.html"
}
})