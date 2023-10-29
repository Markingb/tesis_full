$protocol = "http"
$baseUrl = "localhost:3000"
Function UploadFile {
	[CmdletBinding()]
	Param(
        [string]$file,
        [string]$token
	)
	
    if(! (Test-Path $file) ) {
        Write-Error -Message "Couldn't not find: $file`nSpecify a valid file."
        throw
    }
	$url = "$($protocol)://$($baseUrl)/pdf/upload"
	$fileName = Split-Path -Leaf -Path $file
	$base64PDF = [convert]::ToBase64String((Get-Content $file -AsByteStream))
	$request = @{
	    Uri=$url;
	    Method="POST";
	    Body=$base64PDF;
	    Headers=@{
	        FileName=$fileName;
	        ContentType="application/base64";
            splitValue=2;
            authorization="Bearer $token"
	    }
	}

	Invoke-RestMethod @request
}

Function ExtractData {
    [CmdletBinding()]
    Param(
        [Parameter(Mandatory=$true)]
        [string]$id,
        [string]$token
    )

    $request = @{
        Uri="$($protocol)://$($baseUrl)/pdf/upload/options/$id";
        Method="POST";
        Headers=@{
            authorization="Bearer $token"
        }
    }

    Invoke-RestMethod @request
}

Function Login {
    [CmdletBinding()]
    Param(
        [Parameter(Mandatory=$true)]
        [string]$username
    )

    $request = @{
        Uri="$($protocol)://$($baseUrl)/login";
        Method="POST";
        Body= @{
            username=$username;
        } | ConvertTo-Json -Depth 1;
        Headers=@{
            "Content-Type"="application/json";
        }
    }

    Invoke-RestMethod @request -Verbose

}
return
ls /home/shuffle/Downloads/
$base64PDF = [convert]::ToBase64String((Get-Content "/home/shuffle/Downloads/Kardex.pdf" -AsByteStream))
$base64PDF
UploadFile -file "/home/shuffle/Downloads/Kardex 401 IS.PDF" -token $token.accessToken
ExtractData -id "Kardex 401 IS" -Verbose -token $token.accessToken

$token = Login -username "Daniel"
Invoke-RestMethod -Uri http://localhost:3000 -Headers @{authorization="Bearer $($token.accessToken)"} | `
Out-File '/home/shuffle/Documents/multi_pdf/test.html'

Invoke-RestMethod -Uri http://localhost:3000/pdf -Headers @{authorization="Bearer $($token.accessToken)"}

Invoke-RestMethod -Uri http://localhost:3000





<#
    * Pron�sticos dependiendo de la facultad desde donde
    viene el alumno hacia la facultad (Bachillerato)

    * Graficar resultados: Matem�ticas, l�gica, etc.



    Pendiente:
    Cubrir PDf multi-kardex    (split 2 o 'n' hoja) 
    Cubrir pdf kardex �nico

    Separar por generaci�n

    generaci�n ->
        -> 2015 - 2019
        -> 2013 - 2019

    ###->Define fecha inicial###

#>