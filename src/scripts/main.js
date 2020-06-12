
'use strict';

import "core-js";
//import "regenerator-runtime/runtime";
import MCombobox from './MCombobox';

function Main(e)
{
    window.mcombobox = new MCombobox();

} // Main


function OnLoaded(e)
{
    window.mcombobox.Init();

} // OnLoaded


window.addEventListener( "DOMContentLoaded", Main );
window.addEventListener( "load",             OnLoaded );

