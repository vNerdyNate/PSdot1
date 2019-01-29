#This will run a pull for all sql instances in a domain. This will not export-csv properly as its an array object.
#
Import-Module ActiveDirectory
$servers = Get-ADComputer -Filter * | Select-Object Name | Export-Csv 'C:\servers.csv' -Force -NoTypeInformation
$file = 'C:\servers.csv'
(Get-Content $File) | Foreach-Object {$_ -replace '"',''} | Set-Content $File
(Get-Content $File) | Foreach-Object {$_ -replace ' ',''} | Set-Content $File
$ssALL1 = Get-Content -Path $file

$servers1 = $ssALL1.split(" ")
Start-Transcript -Path "C:\transcript.txt"
$time = Get-Date       
Write-Host $time
$WarningPreference = 'SilentlyContinue'
foreach($s in $servers1){
#Write-Host "$s"
            # 1 = MSSQLSERVER
            $Filter = "SELECT * FROM SqlServiceAdvancedProperty WHERE SqlServiceType=1" 
            $WMIParams=@{
                Computername = $s
                NameSpace='root\Microsoft\SqlServer'
                Query="SELECT name FROM __NAMESPACE WHERE name LIKE 'ComputerManagement%'"
                Authentication = 'PacketPrivacy'
                ErrorAction = 'Stop'
            }
                        Write-Verbose "[$s] Starting SQL Scan"
            $PropertyHash = [ordered]@{
                Computername = $s
                SKUNAME = $NullF
            }
            Try {
                Write-Verbose "[$s] Performing Registry Query"
                $Registry = [Microsoft.Win32.RegistryKey]::OpenRemoteBaseKey('LocalMachine', $s) 
            }
            Catch {
                Write-Warning "[$s] $_"
                Continue
            }
            $baseKeys = "SOFTWARE\\Microsoft\\Microsoft SQL Server",
            "SOFTWARE\\Wow6432Node\\Microsoft\\Microsoft SQL Server"
            Try {
                $ErrorActionPreference = 'Stop'
                If ($Registry.OpenSubKey($basekeys[0])) {
                    $regPath = $basekeys[0]
                } 
                ElseIf ($Registry.OpenSubKey($basekeys[1])) {
                    $regPath = $basekeys[1]
                } 
                Else {
                    Continue
                }
            } 
            Catch {
                Continue
            }
            Finally {
                $ErrorActionPreference = 'Continue'
            }
            $RegKey= $Registry.OpenSubKey("$regPath")
            If ($RegKey.GetSubKeyNames() -contains "Instance Names") {
                $RegKey= $Registry.OpenSubKey("$regpath\\Instance Names\\SQL" ) 
                $instances = @($RegKey.GetValueNames())
            } 
            ElseIf ($regKey.GetValueNames() -contains 'InstalledInstances') {
                $isCluster = $False
                $instances = $RegKey.GetValue('InstalledInstances')
            } 
            Else {
                Continue
            }

            If ($instances.count -gt 0) { 
                ForEach ($Instance in $Instances) {
                    $PropertyHash['Instance']=$Instance
                    $Nodes = New-Object System.Collections.Arraylist
                    $clusterName = $Null
                    $isCluster = $False
                    $instanceValue = $regKey.GetValue($instance)
                    $instanceReg = $Registry.OpenSubKey("$regpath\\$instanceValue")
                    If ($instanceReg.GetSubKeyNames() -contains "Cluster") {
                        $isCluster = $True
                        $instanceRegCluster = $instanceReg.OpenSubKey('Cluster')
                        $clusterName = $instanceRegCluster.GetValue('ClusterName')
                        $clusterReg = $Registry.OpenSubKey("Cluster\\Nodes")                            
                        $clusterReg.GetSubKeyNames() | ForEach {
                            $null = $Nodes.Add($clusterReg.OpenSubKey($_).GetValue('NodeName'))
                        }                    
                    }  
                    #$PropertyHash['Nodes'] = $Nodes

                    $instanceRegSetup = $instanceReg.OpenSubKey("Setup")
                    Try {
                        $edition = $instanceRegSetup.GetValue('Edition')
                    } Catch {
                        $edition = $Null
                    }
                    $PropertyHash['Skuname'] = $edition
                    Try {
                        $ErrorActionPreference = 'Stop'
                        #Get from filename to determine version
                        $servicesReg = $Registry.OpenSubKey("SYSTEM\\CurrentControlSet\\Services")
                        $serviceKey = $servicesReg.GetSubKeyNames() | Where {
                            $_ -match "$instance"
                        } | Select -First 1
                        $service = $servicesReg.OpenSubKey($serviceKey).GetValue('ImagePath')
                        $file = $service -replace '^.*(\w:\\.*\\sqlservr.exe).*','$1'
                        $PropertyHash['version'] =(Get-Item ("\\$s\$($file -replace ":","$")")).VersionInfo.ProductVersion
                    } 
                    Catch {
                        #Use potentially less accurate version from registry
                        $PropertyHash['Version'] = $instanceRegSetup.GetValue('Version')
                    } 
                    Finally {
                        $ErrorActionPreference = 'Continue'
                    }
                   Try {
                        Write-Verbose "[$s] Performing WMI Query"
                        $Namespace = $Namespace = (Get-WMIObject @WMIParams | Sort-Object -Descending | Select-Object -First 1).Name
                        If ($Namespace) {
                            #$PropertyHash['WMINamespace'] = $Namespace
                            $WMIParams.NameSpace="root\Microsoft\SqlServer\$Namespace"
                            $WMIParams.Query=$Filter

                            $WMIResults = Get-WMIObject @WMIParams 
                            $GroupResults = $WMIResults | Group ServiceName
                            $PropertyHash['Instance'] = $GroupResults.Name
                            $WMIResults | ForEach {
                                $Name = "{0}{1}" -f ($_.PropertyName.SubString(0,1),$_.PropertyName.SubString(1).ToLower())    
                                $Data = If ($_.PropertyStrValue) {
                                    $_.PropertyStrValue
                                }
                                Else {
                                    If ($Name -match 'Clustered|ErrorReporting|SqmReporting|IsWow64') {
                                        [bool]$_.PropertyNumValue
                                    }
                                    Else {
                                        $_.PropertyNumValue
                                    }        
                                }
                                #$PropertyHash[$Name] = $Data
                            }

                            <#region Always on availability group
                            if ($PropertyHash['Version'].Major -ge 11) {                                          
                                $splat.Query="SELECT WindowsFailoverClusterName FROM HADRServiceSettings WHERE InstanceName = '$($Group.Name)'"
                                $PropertyHash['AlwaysOnName'] = (Get-WmiObject @WMIParams).WindowsFailoverClusterName
                                if ($PropertyHash['AlwaysOnName']) {
                                    $PropertyHash.SqlServer = $PropertyHash['AlwaysOnName']
                                }
                            } 
                            else {
                                $PropertyHash['AlwaysOnName'] = $null
                            }  
                            #endregion Always on availability group
                            #>
                            #region Backup Directory
                            #$RegKey=$Registry.OpenSubKey("$($PropertyHash['RegRoot'])\MSSQLServer")
                            
                            #endregion Backup Directory
                        }#IF NAMESPACE
                    }
                    Catch {
                    }
                    #region Caption
                    $Caption = {Switch -Regex ($PropertyHash['version']) {
                        "^13" {'SQL Server 2016';Break}
                        "^12" {'SQL Server 2014';Break}
                        "^11" {'SQL Server 2012';Break}
                        "^10\.5" {'SQL Server 2008 R2';Break}
                        "^10" {'SQL Server 2008';Break}
                        "^9"  {'SQL Server 2005';Break}
                        "^8"  {'SQL Server 2000';Break}
                        Default {'Unknown'}
                    }}.InvokeReturnAsIs()
                    $PropertyHash['Caption'] = $Caption
                    #endregion Caption

                    #region Full SQL Name
                    $Name = If ($clusterName) {
                        $clusterName
                        #$PropertyHash['SqlServer'] = $clusterName
                    }
                    Else {
                        $s
                        #$PropertyHash['SqlServer'] = $s
                    }
                    #$PropertyHash['FullName'] = ("{0}\{1}" -f $Name,$PropertyHash['Instance'])
                    #emdregion Full SQL Name                        
                    $Object = [pscustomobject]$PropertyHash
                    $Object.pstypenames.insert(0,'SQLServer.Information')
                   $Object | Format-Table
                    #Select-Object $Object -ExcludeProperty SqlServer,SqlServer,WmiNamespace,SQLSTATES.SPLEVEL,CLUSTERED INSTALLPATH,DATAPATH,LANGUAGE,FILEVERSION,VSNAME,REGROOT,STARTUPPARAMETERS,ERRORREPORTING,DUMPDIR,SQMREPORTING,ISWOW64,BackupDirectory,AlwaysOnName         
                }#FOREACH INSTANCE                 
           }
         }
$endtime = Get-Date       
Write-Host "$endtime"

 