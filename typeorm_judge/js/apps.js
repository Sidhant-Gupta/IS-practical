$(document).ready(function() {
	var apps = {
		unit_testing: function(prime,base,a,b){
			var public_key_a = diffieHellman.getPublicKeyDiffieHellman(prime,base,a);
			var public_key_b = diffieHellman.getPublicKeyDiffieHellman(prime,base,b);

			var s1 = diffieHellman.getSharedKeyDiffieHellman(prime,a,public_key_b);
			var s2 = diffieHellman.getSharedKeyDiffieHellman(prime,b,public_key_a);

			var brute = diffieHellman.cryptaAnalysisDiffieHellman(prime,base,public_key_a,public_key_b);

			var passed = (brute.integer.a == a && brute.integer.b == b && brute.secret == s1) ? true : false;

			console.log({
				"A":a,
				"B":b,
				"Public A":public_key_a,
				"Public B":public_key_b,
				"Secret A":s1,
				"Secret B":s2,
				"Bruteforce":brute,
				"Passed":passed
			});
		},
		generatePublicKey: function(){
			var shared_prime = $('#shared-prime').val();
			var shared_base = $('#shared-base').val();
			var shared_integer = $('#shared-integer').val();
			$('#shared-key').val(diffieHellman.getPublicKeyDiffieHellman(shared_prime,shared_base,shared_integer));
		},
		generateSharedSecret: function(){
			var secret_prime = $('#secret-prime').val();
			var secret_integer = $('#secret-integer').val();
			var secret_shared = $('#secret-shared').val();
			$('#secret-key').val(diffieHellman.getSharedKeyDiffieHellman(secret_prime,secret_integer,secret_shared));
		},
		cryptaAnalysis: function(){
			var bruteforce_prime = $('#bruteforce-prime').val();
			var bruteforce_base = $('#bruteforce-base').val();
			var bruteforce_shared_a = $('#bruteforce-shared-a').val();
			var bruteforce_shared_b = $('#bruteforce-shared-b').val();
			var bruteforce_result = diffieHellman.cryptaAnalysisDiffieHellman(bruteforce_prime,bruteforce_base,bruteforce_shared_a,bruteforce_shared_b);
			$('#bruteforce-integer-a').val(bruteforce_result.integer.a);
			$('#bruteforce-integer-b').val(bruteforce_result.integer.b);
			$('#bruteforce-key').val(bruteforce_result.secret);
			console.log(bruteforce_result);
		}
	};

	$('#shared-prime, #shared-base, #shared-integer').change(apps.generatePublicKey);
	$('#shared-prime, #shared-base, #shared-integer').keyup(apps.generatePublicKey);

	$('#secret-prime, #secret-integer, #secret-shared').change(apps.generateSharedSecret);
	$('#secret-prime, #secret-integer, #secret-shared').keyup(apps.generateSharedSecret);

	$('#bruteforce-button').click(apps.cryptaAnalysis);

	apps.unit_testing(23,5,6,15);
});
$(document).foundation();
