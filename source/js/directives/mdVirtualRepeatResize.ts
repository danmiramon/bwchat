//Code from Angular Material devs
//user:nkoterba https://github.com/angular/material/issues/4314
angular.module("chatApp")
.directive("mdVRResize", directive);

function directive(){
    return {
        restrict: 'A',
        require: '^mdVirtualRepeatContainer',
        link: link
    };
}

function link(scope, element, attributes, mdVirtualRepeatContainer)
{
    // Watch the offsetHeight (not great...triggers browser reflow...but oh well)
    // When it changes, call the md-virtual-repeat-container controller's internal
    // updateSize() (could also call setSize_ with the value but still need to trigger an update
    scope.$watch(function () {
        return element[0].parentNode.offsetHeight;
    }, function(value){
        mdVirtualRepeatContainer.updateSize();
    });
}
