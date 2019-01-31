var i=0;
Names = new Array();
if(FirstName == null){
return ;
}
else{
if(LastName == null){
return ;
}
else{
for(n in FirstName){
var Name = FirstName[i] + "." + LastName[i];
var userArray = ActiveDirectory.search("User", Name, ADHost);
if (userArray[0] == undefined){
var noexist = Name + " does not exist"
Names.push(noexist);
}else {
var exists = Name + " exists"
Names.push(exists);
}
i++
}
return Names
}
}