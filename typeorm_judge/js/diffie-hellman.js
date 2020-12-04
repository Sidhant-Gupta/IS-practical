var diffieHellman = {
	getPublicKeyDiffieHellman: function(prime, base, integer){
		return Math.pow(base, integer) % prime;
	},
	getSharedKeyDiffieHellman: function(prime, integer, public_key){
		return Math.pow(public_key, integer) % prime;
	},
	cryptaAnalysisDiffieHellman: function(prime, base, public_key_a, public_key_b, limit){
		limit = (typeof limit === "undefined") ? 1000 : limit;

		var attempt = -1;
		var integer_a = 0;
		var integer_b = 0;

		while(attempt != public_key_a && integer_a < limit){
			attempt = this.getPublicKeyDiffieHellman(prime,base,integer_a++);
		}
		attempt = -1;
		while(attempt != public_key_b && integer_b < limit){
			attempt = this.getPublicKeyDiffieHellman(prime,base,integer_b++);
		}

		integer_a = integer_a - 1;
		integer_b = integer_b - 1;

		return {
			integer: {
				a:integer_a,
				b:integer_b
			},
			secret: this.getSharedKeyDiffieHellman(prime, integer_a, public_key_b)
		};
	}
}