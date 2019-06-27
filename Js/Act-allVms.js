if (vapiEndpoint == null) {
    throw "'endpoint' parameter should not be null";
  }
  if (tagId == null) {
    throw "'tagId' parameter should not be null";
  }
  
  var i = 0;
  while (i<5){
  
      try {
          var client = vapiEndpoint.client();
          var tagging = new com_vmware_cis_tagging_tag__association(client);
          var enumerationId = new com_vmware_vapi_std_dynamic__ID() ;
          enumerationId.id = vcVm.id;
          enumerationId.type = vcVm.vimType;
          tagging.attach(tagId, enumerationId);
          System.debug("Tag ID " + tagId + " assigned to VC VM " + vcVm.name);
          i=5;
  
      } catch(e) {
          System.debug("Associating " + tagId + " failed. Retrying " + i + " of 5 attempts");
          i++;
          if (i=4) { System.error(e.message); }
      }
  }
  if (vapiEndpoint == null) {
    throw "'endpoint' parameter should not be null";
    }
    if (tagId == null) {
    throw "'tagId' parameter should not be null";
    }
    
    var i = 0;
    while (i<6){
    
    try {
    var client = vapiEndpoint.client();
    var tagging = new com_vmware_cis_tagging_tag__association(client);
    var enumerationId = new com_vmware_vapi_std_dynamic__ID() ;
    enumerationId.id = vcVm.id;
    enumerationId.type = vcVm.vimType;
    tagging.attach(tagId, enumerationId);
    System.debug("Tag ID " + tagId + " assigned to VC VM " + vcVm.name);
    i=5;
    
    } catch(e) {
    System.debug("Associating " + tagId + " failed. Retrying " + i + " of 5 attempts");
    i++;
    System.log("i = " + i)
    if (i==6) {
    System.error(e.message); 
    throw e.message}
    }
    }