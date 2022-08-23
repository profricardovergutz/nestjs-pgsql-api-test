import{ sleep } from 'k6';
import http from 'k6/http';
  
export let options = {
    duration : '10s',
    vus : 1000,
};

export default function() {
    http.get('http://localhost:3000/users');
    //sleep(0.300);
}