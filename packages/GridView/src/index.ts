import GridView from './GridView'

const gird = new GridView('#gridView', {
    frames: 3,
    cover: 'https://github.com/zprial/Blackbox/blob/master/packages/GridView/src/demo.png?raw=true',
    onSuccess() {
        alert('Great, you succeed!')
    }
})

gird.init();

document.getElementById('reset').addEventListener('click', function() {
    gird.reset();
});
