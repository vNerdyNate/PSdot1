If (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator"))
{
    Write-Warning "You do not have Administrator rights to run this script!`nPlease re-run this script as an Administrator!"
}
else
{
    cls
    $sb = '
    if ([Environment]::OSVersion.Version -gt "6.3")
    {
        $IPV6 = $false
        $arrInterfaces = (Get-WmiObject -class Win32_NetworkAdapterConfiguration -filter "ipenabled = TRUE").IPAddress
        foreach ($i in $arrInterfaces) {$IPV6 = $IPV6 -or $i.contains(":")}
        write-host $env:COMPUTERNAME":"$IPV6
    }
    else
    {
       Write-Output "This script works on Windows Server 2012 R2 and Windows 8.1, $env:COMPUTERNAME is not running an approved OS."
    }    
    '
    $scriptblock = [ScriptBlock]::Create($sb)
    
    $ServersToProcess = Get-Content -Path 'C:\temp\servers.csv'
    Write-Output "Begining Processing, Please be Patient"
    Invoke-Command -ComputerName $ServersToProcess -ScriptBlock $scriptblock | FT
}