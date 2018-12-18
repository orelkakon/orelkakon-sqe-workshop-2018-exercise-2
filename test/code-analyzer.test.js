import assert from 'assert';
import {start} from '../src/js/code-analyzer';

describe('Some case With empty function: ', () => {
    it('empty func', () => {
        assert.equal(printArr(start('function test1(x, y, z){\n' +
            '}\n','1,2,3')),'function test1(x, y, z) {\n' +
            '}');
    });

    it('empty func with globals', () => {
        assert.equal(printArr(start('let x = 3;\n' +
            'let d = x + 1;\n' +
            'let n = c * d; \n' +
            'function test2(x, y, z){\n' +
            '}\n','2,3,4')),'function test2(x, y, z) {\n' +
            '}');
    });

    it('empty func with many globals before and after', () => {
        assert.equal(printArr(start('let x = 3;\n' +
            'let c = x + 1;\n' +
            'let n = c * d; \n' +
            'function test2(x, y, z){\n' +
            '}\n' +
            'let v = 99;\n' +
            'let f = w - 12;\n' +
            'let l = f * f; \n' +
            'let c = 16 - 3;','[1],2,3')),'function test2(x, y, z) {\n' +
            '}');
    });

    it('little func', () => {
        assert.equal(printArr(start('let i = 1;\n' +
            'function TTT(o){\n' +
            'return o;\n' +
            '}','[[1,2],2,3]')),'function TTT(o) {\n' +
            'return o;\n' +
            '}');
    });

});

describe('Examples from site', () => {
    it('Example1', () => {
        assert.equal(printArr(start('function foo(g, y, z){\n' +
            '    let a = g + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    if (b < z) {\n' +
            '        c = c + 5;\n' +
            '        return g + y + z + c;\n' +
            '    } else if (b < z * 2) {\n' +
            '        c = c + g + 5;\n' +
            '        return g + y + z + c;\n' +
            '    } else {\n' +
            '        c = c + z + 5;\n' +
            '        return g + y + z + c;\n' +
            '    }\n' +
            '}\n','1,2,3')),'function foo(g, y, z) {\n' +
            'if ( g+1+y < z ) {     //this line is red\n' +
            'return g + y + z + 0 + 5;\n' +
            '} else if ( g+1+y < z * 2 ) {     //this line is green\n' +
            'return g + y + z + 0 + g + 5;\n' +
            '} else {\n' +
            'return g + y + z + 0 + z + 5;\n' +
            '}\n' +
            '}');
    });

    it('Example2', () => {
        assert.equal(printArr(start('function foo(l, y, z){\n' +
            '    let a = l + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    while (a < z) {\n' +
            '        c = a + b;\n' +
            '        z = c * 2;\n' +
            '    }\n' +
            '    \n' +
            '    return z;\n' +
            '}\n','7,8,9')),'function foo(l, y, z) {\n' +
            'while ( l+1 < z ) {\n' +
            'z = l+1 + l+1+y * 2 ;\n' +
            '}\n' +
            'return z;\n' +
            '}');
    });

});

describe('regular function case', () => {
    it('test1:', () => {
        assert.equal(printArr(start('function foo(f, y, z){\n' +
            '                let a = f + 1;\n' +
            '                let b = a + y;\n' +
            '                let c = b + b;\n' +
            '                while (c < f) {\n' +
            '                    f = c + b; \n' +
            '                    z = a * 2;\n' +
            '                }\n' +
            '                return y;\n' +
            '            }', '2,5,6')), 'function foo(f, y, z) {\n' +
            'while ( f+1+y+f+1+y < f ) {\n' +
            'f = f+1+y+f+1+y + f+1+y ;\n' +
            'z = f+1 * 2 ;\n' +
            '}\n' +
            'return y;\n' +
            '}');
    });

    it('test2:', () => {
        assert.equal(printArr(start('function foo(f, y){\n' +
            '                let a = f + 1;\n' +
            '                let b = a + y;\n' +
            '                let c = b + b;\n' +
            '               \n' +
            '                if( b < c ){\n' +
            '                   return 3;\n' +
            '                } else{\n' +
            '                  return 6;\n' +
            '               }\n' +
            '                return y;\n' +
            '            }', '10,15')), 'function foo(f, y) {\n' +
            'if ( f+1+y < f+1+y+f+1+y ) {     //this line is green\n' +
            'return 3;\n' +
            '} else {\n' +
            'return 6;\n' +
            '}\n' +
            'return y;\n' +
            '}');
    });

    it('test3:', () => {
        assert.equal(printArr(start('function foo(m, y){\n' +
            '                let a = m + 1;\n' +
            '                let b = a + y;\n' +
            '                let c = b + b;\n' +
            '                \n' +
            '                if( b < c ){\n' +
            '                   return 3;\n' +
            '                } else if(b > c){\n' +
            '                   return 5;\n' +
            '                } else {\n' +
            '                   return m;\n' +
            '                }\n' +
            '            }', '1,2')), 'function foo(m, y) {\n' +
            'if ( m+1+y < m+1+y+m+1+y ) {     //this line is green\n' +
            'return 3;\n' +
            '} else if ( m+1+y > m+1+y+m+1+y ) {     //this line is red\n' +
            'return 5;\n' +
            '} else {\n' +
            'return m;\n' +
            '}\n' +
            '}');
    });

    it('test4:', () => {
        assert.equal(printArr(start('function foo(z, y){ \n' +
            '                let a = z;    \n' +
            '                if(a == z){\n' +
            '                   return y;\n' +
            '                } \n' +
            '                else{\n' +
            '                   return z;\n' +
            '                }\n' +
            '            }', '1,2')), 'function foo(z, y) {\n' +
            'if ( z == z ) {     //this line is green\n' +
            'return y;\n' +
            '} else {\n' +
            'return z;\n' +
            '}\n' +
            '}');
    });

    it('test5:', () => {
        assert.equal(printArr(start('let n = 1;\n' +
            '            function foo(t, y){\n' +
            '                let a = y;    \n' +
            '                if(a == 1){\n' +
            '                   return y;\n' +
            '               } \n' +
            '                else{\n' +
            '                   return t;\n' +
            '                }\n' +
            '            }', '1,2')), 'function foo(t, y) {\n' +
            'if ( y == 1 ) {     //this line is red\n' +
            'return y;\n' +
            '} else {\n' +
            'return t;\n' +
            '}\n' +
            '}');
    });

    it('test 6:', () => {
        assert.equal(printArr(start(
            'let w = [\'hello\'];\n'+
            'let m = [1,2,3];\n' +
            'function test1(x, y, z){\n' +
            '}\n','1,2,3')),'function test1(x, y, z) {\n' +
            '}');
    });

    it('test 7:', () => {
        assert.equal(printArr(start(
            '\n' +
            'function foo(k, p){\n' +
            'if(\'hello\' == p){\n' +
            '    let q = 1;\n' +
            '    return p;\n' +
            '}\n' +
            '}','"hello",2')),'function foo(k, p) {\n' +
            'if ( \'hello\' == p ) {     //this line is red\n' +
            'return p;\n' +
            '}\n' +
            '}');
    });

    it('test 8:', () => {
        assert.equal(printArr(start('let c=0;\n' +
            'function TTT(f,y,z){\n' +
            'let a = f + 1;\n' +
            'c = f;\n' +
            'while(a < z){\n' +
            'z = a * 2;\n' +
            '}\n' +
            'return z;\n' +
            '}','1,2,3')),'function TTT(f, y, z) {\n' +
            'while ( f+1 < z ) {\n' +
            'z = f+1 * 2 ;\n' +
            '}\n' +
            'return z;\n' +
            '}');
    });

    it('test9:', () => {
        assert.equal(printArr(start('let c= [1,2,3];\n' +
            'function TTT(f,y,z){\n' +
            'if(1<2){\n' +
            'return c[2];\n' +
            '}\n' +
            'return c[1] + f + x + z ;\n' +
            '}','1,2,3')),'function TTT(f, y, z) {\n' +
            'if ( 1 < 2 ) {     //this line is green\n' +
            'return f[2];\n' +
            '}\n' +
            'return f[1] + f + x + z;\n' +
            '}');
    });

    it('test 10:', () => {
        assert.equal(printArr(start('let q = 1;\n' +
            'function TTT(h){\n' +
            'if(1<2)\n' +
            'return q;\n' +
            '\n' +
            'if(2<3)\n' +
            'c++;\n' +
            '\n' +
            'if(5<2)\n' +
            'c = 4;\n' +
            '\n' +
            'return c;\n' +
            '}','1')),'function TTT(h) {\n' +
            'if ( 1 < 2 ) {     //this line is green\n' +
            'return 1;\n' +
            '}\n' +
            'if ( 2 < 3 ) {     //this line is green\n' +
            '}\n' +
            'if ( 5 < 2 ) {     //this line is red\n' +
            '}\n' +
            'return 4;\n' +
            '}');
    });

});




function printArr(arr) {
    let newarr='';
    for(let i=0;i<arr.length-1;i++){
        newarr = newarr + arr[i]+ '\n';
    }
    newarr = newarr + arr[arr.length-1];
    return newarr;
}
