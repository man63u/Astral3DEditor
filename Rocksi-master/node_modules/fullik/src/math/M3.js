import { V3 } from './V3.js';
import { math } from './Math.js';

export class M3 {

    constructor(n11, n12, n13, n21, n22, n23, n31, n32, n33) {

		M3.prototype.isMatrix3 = true;

		this.elements = [

			1, 0, 0,
			0, 1, 0,
			0, 0, 1

		];

		if ( arguments.length > 0 ) {

			console.error( 'M3: the constructor no longer reads arguments. use .set() instead.' );

		}
		if ( n11 !== undefined ) {

			this.set( n11, n12, n13, n21, n22, n23, n31, n32, n33 );

		}

	}

	get XBasis(){ return new V3(this.elements[0], this.elements[1], this.elements[2]); }
	set XBasis(v){this.elements[0] = v.x; this.elements[1] = v.y; this.elements[2] = v.z;}

	get YBasis(){ return new V3(this.elements[3], this.elements[4], this.elements[5]); }
	set YBasis(v){this.elements[3] = v.x; this.elements[4] = v.y; this.elements[5] = v.z;}

	get ZBasis(){ return new V3(this.elements[6], this.elements[7], this.elements[8]); }
	set ZBasis(v){this.elements[6] = v.x; this.elements[7] = v.y; this.elements[8] = v.z;}


	set( n11, n12, n13, n21, n22, n23, n31, n32, n33 ) {

		let te = this.elements;

		te[ 0 ] = n11; te[ 1 ] = n21; te[ 2 ] = n31;
		te[ 3 ] = n12; te[ 4 ] = n22; te[ 5 ] = n32;
		te[ 6 ] = n13; te[ 7 ] = n23; te[ 8 ] = n33;

		return this;

	}

	identity() {

		this.set(

			1, 0, 0,
			0, 1, 0,
			0, 0, 1

		);

		return this;

	}

	setV3( xAxis, yAxis, zAxis ) {

		const te = this.elements;

	    te[ 0 ] = xAxis.x;
	    te[ 3 ] = xAxis.y; 
	    te[ 6 ] = xAxis.z;
	        
	    te[ 1 ] = yAxis.x;
	    te[ 4 ] = yAxis.y; 
	    te[ 7 ] = yAxis.z;
	        
	    te[ 2 ] = zAxis.x;
	    te[ 5 ] = zAxis.y; 
	    te[ 8 ] = zAxis.z;

	    return this;

	}

	transpose() {

		let tmp, m = this.elements;

		tmp = m[ 1 ]; m[ 1 ] = m[ 3 ]; m[ 3 ] = tmp;
		tmp = m[ 2 ]; m[ 2 ] = m[ 6 ]; m[ 6 ] = tmp;
		tmp = m[ 5 ]; m[ 5 ] = m[ 7 ]; m[ 7 ] = tmp;

		return this;

	}

	createRotationMatrix( referenceDirection ) {

	    // NEW VERSION - 1.3.8

		let zAxis = referenceDirection;
	    let xAxis = new V3(1, 0, 0);
	    let yAxis = new V3(0, 1, 0);
		
		// Singularity fix
		if ( Math.abs( referenceDirection.y ) > 0.9999 ){

			yAxis.copy( xAxis ).cross( zAxis ).normalize();

		} else {

			xAxis.copy( zAxis ).cross( yAxis ).normalize();
			yAxis.copy( xAxis ).cross( zAxis ).normalize();

		}

	    return this.setV3( xAxis, yAxis, zAxis );

	}

	rotateDegs( axis, angleDegs ){
		return this.rotateRads(axis, angleDegs * math.toRad);
	}

	rotateRads( axis, angle ){

		const dest = new this.constructor();
		let sin = Math.sin( angle );
	    let cos = Math.cos( angle );
	    let oneMinusCos = 1.0 - cos;

	    let xy = axis.x * axis.y;
		let yz = axis.y * axis.z;
		let xz = axis.x * axis.z;
		let xs = axis.x * sin;
		let ys = axis.y * sin;
		let zs = axis.z * sin;

		let f00 = axis.x * axis.x * oneMinusCos + cos;
		let f01 = xy * oneMinusCos + zs;
		let f02 = xz * oneMinusCos - ys;

		let f10 = xy * oneMinusCos - zs;
		let f11 = axis.y * axis.y * oneMinusCos + cos;
		let f12 = yz * oneMinusCos + xs;

		let f20 = xz * oneMinusCos + ys;
		let f21 = yz * oneMinusCos - xs;
		let f22 = axis.z * axis.z * oneMinusCos + cos;

		let m = this.elements

		let t00 = m[0] * f00 + m[3] * f01 + m[6] * f02;
		let t01 = m[1] * f00 + m[4] * f01 + m[7] * f02;
		let t02 = m[2] * f00 + m[5] * f01 + m[8] * f02;

		let t10 = m[0] * f10 + m[3] * f11 + m[6] * f12;
		let t11 = m[1] * f10 + m[4] * f11 + m[7] * f12;
		let t12 = m[2] * f10 + m[5] * f11 + m[8] * f12;

		let k = //dest.elements
		// Construct and return rotation matrix
		k[6] = m[0] * f20 + m[3] * f21 + m[6] * f22;
		k[7] = m[1] * f20 + m[4] * f21 + m[7] * f22;
		k[8] = m[2] * f20 + m[5] * f21 + m[8] * f22;

		k[0] = t00;
		k[1] = t01;
		k[2] = t02;

		k[3] = t10;
		k[4] = t11;
		k[5] = t12;

		return dest;

	}

	rotateAboutAxis( v, angle, axis ){

	    let sin = Math.sin( angle );
	    let cos = Math.cos( angle );
	    let oneMinuscos = 1.0 - cos;
	    
	    // It's quicker to pre-calc these and reuse than calculate x * y, then y * x later (same thing).
	    let xyOne = axis.x * axis.y * oneMinuscos;
	    let xzOne = axis.x * axis.z * oneMinuscos;
	    let yzOne = axis.y * axis.z * oneMinuscos;

	    let te = this.elements;

	    // Calculate rotated x-axis
	    te[ 0 ] = axis.x * axis.x * oneMinuscos + cos;
	    te[ 3 ] = xyOne + axis.z * sin;
	    te[ 6 ] = xzOne - axis.y * sin;

	    // Calculate rotated y-axis
	    te[ 1 ] = xyOne - axis.z * sin;
	    te[ 4 ] = axis.y * axis.y * oneMinuscos + cos;
	    te[ 7 ] = yzOne + axis.x * sin;

	    // Calculate rotated z-axis
	    te[ 2 ] = xzOne + axis.y * sin;
	    te[ 5 ] = yzOne - axis.x * sin;
	    te[ 8 ] = axis.z * axis.z * oneMinuscos + cos;

	   // this.identity()
	    const mm = this//.rotateRads(axis, angle);

	    // Multiply the source by the rotation matrix we just created to perform the rotation
	    return v.clone().applyM3( mm );

	}


	///////

	determinant() {

		const te = this.elements;

		const a = te[ 0 ], b = te[ 1 ], c = te[ 2 ],
			d = te[ 3 ], e = te[ 4 ], f = te[ 5 ],
			g = te[ 6 ], h = te[ 7 ], i = te[ 8 ];

		return a * e * i - a * f * h - b * d * i + b * f * g + c * d * h - c * e * g;

	}

	invert() {

		const te = this.elements,

			n11 = te[ 0 ], n21 = te[ 1 ], n31 = te[ 2 ],
			n12 = te[ 3 ], n22 = te[ 4 ], n32 = te[ 5 ],
			n13 = te[ 6 ], n23 = te[ 7 ], n33 = te[ 8 ],

			t11 = n33 * n22 - n32 * n23,
			t12 = n32 * n13 - n33 * n12,
			t13 = n23 * n12 - n22 * n13,

			det = n11 * t11 + n21 * t12 + n31 * t13;

		if ( det === 0 ) return this.set( 0, 0, 0, 0, 0, 0, 0, 0, 0 );

		const detInv = 1 / det;

		te[ 0 ] = t11 * detInv;
		te[ 1 ] = ( n31 * n23 - n33 * n21 ) * detInv;
		te[ 2 ] = ( n32 * n21 - n31 * n22 ) * detInv;

		te[ 3 ] = t12 * detInv;
		te[ 4 ] = ( n33 * n11 - n31 * n13 ) * detInv;
		te[ 5 ] = ( n31 * n12 - n32 * n11 ) * detInv;

		te[ 6 ] = t13 * detInv;
		te[ 7 ] = ( n21 * n13 - n23 * n11 ) * detInv;
		te[ 8 ] = ( n22 * n11 - n21 * n12 ) * detInv;

		return this;

	}

	multiplyMatrices( a, b ) {

		const ae = a.elements;
		const be = b.elements;
		const te = this.elements;

		const a11 = ae[ 0 ], a12 = ae[ 3 ], a13 = ae[ 6 ];
		const a21 = ae[ 1 ], a22 = ae[ 4 ], a23 = ae[ 7 ];
		const a31 = ae[ 2 ], a32 = ae[ 5 ], a33 = ae[ 8 ];

		const b11 = be[ 0 ], b12 = be[ 3 ], b13 = be[ 6 ];
		const b21 = be[ 1 ], b22 = be[ 4 ], b23 = be[ 7 ];
		const b31 = be[ 2 ], b32 = be[ 5 ], b33 = be[ 8 ];

		te[ 0 ] = a11 * b11 + a12 * b21 + a13 * b31;
		te[ 3 ] = a11 * b12 + a12 * b22 + a13 * b32;
		te[ 6 ] = a11 * b13 + a12 * b23 + a13 * b33;

		te[ 1 ] = a21 * b11 + a22 * b21 + a23 * b31;
		te[ 4 ] = a21 * b12 + a22 * b22 + a23 * b32;
		te[ 7 ] = a21 * b13 + a22 * b23 + a23 * b33;

		te[ 2 ] = a31 * b11 + a32 * b21 + a33 * b31;
		te[ 5 ] = a31 * b12 + a32 * b22 + a33 * b32;
		te[ 8 ] = a31 * b13 + a32 * b23 + a33 * b33;

		return this;

	}

	premultiply( m ) {

		return this.multiplyMatrices( m, this );

	}

	multiply( m ) {

		return this.multiplyMatrices( this, m );

	}

	setFromMatrix4( m ) {

		const me = m.elements;

		this.set(

			me[ 0 ], me[ 4 ], me[ 8 ],
			me[ 1 ], me[ 5 ], me[ 9 ],
			me[ 2 ], me[ 6 ], me[ 10 ]

		);

		return this;

	}

	copy( m ) {

		const te = this.elements;
		const me = m.elements;

		te[ 0 ] = me[ 0 ]; te[ 1 ] = me[ 1 ]; te[ 2 ] = me[ 2 ];
		te[ 3 ] = me[ 3 ]; te[ 4 ] = me[ 4 ]; te[ 5 ] = me[ 5 ];
		te[ 6 ] = me[ 6 ]; te[ 7 ] = me[ 7 ]; te[ 8 ] = me[ 8 ];

		return this;

	}

	fromArray( array, offset = 0 ) {

		for ( let i = 0; i < 9; i ++ ) {

			this.elements[ i ] = array[ i + offset ];

		}

		return this;

	}

	toArray( array = [], offset = 0 ) {

		const te = this.elements;

		array[ offset ] = te[ 0 ];
		array[ offset + 1 ] = te[ 1 ];
		array[ offset + 2 ] = te[ 2 ];

		array[ offset + 3 ] = te[ 3 ];
		array[ offset + 4 ] = te[ 4 ];
		array[ offset + 5 ] = te[ 5 ];

		array[ offset + 6 ] = te[ 6 ];
		array[ offset + 7 ] = te[ 7 ];
		array[ offset + 8 ] = te[ 8 ];

		return array;

	}

	clone() {

		return new this.constructor().fromArray( this.elements );

	}

	isOrthogonal(){

		const xCrossYDot = this.XBasis.dot(this.YBasis);
		const xCrossZDot = this.XBasis.dot(this.ZBasis);
		const yCrossZDot = this.YBasis.dot(this.ZBasis);
		if ( math.nearEquals(xCrossYDot, 0.0,  0.01) && math.nearEquals(xCrossZDot, 0.0,  0.01) && math.nearEquals(yCrossZDot, 0.0,  0.01) ) return true;
		return false;

	}

}