name = app + "-" + env + "-" + type
var inum = 0
sSearchPattern = name + inum
// Get a list of computers matching the pattern in strComputer
var computers = ActiveDirectory.getComputerADRecursively(sSearchPattern,defaultADServer);
if(computers[0] != null)
{
	foreach(computer in computers)
	{
		inum = Math.max(inum, computer.name.substring(sSearchPattern.length));
	}
}
inum=inum+1;

//pad a string number with zeros up to 2 characters in length
var snum=String(inum)
while (snum.length < (2)) {snum = "0" + snum;}

//build the new name
var newName = sSearchPattern+snum

// Validate the newly minted name, to make sure it doesn't exist
var computers = ActiveDirectory.getComputerADRecursively(newName,defaultADServer);
if(computers[0] == null)
	{
	newComputerName = newName;
	}
else
{}
return newName;