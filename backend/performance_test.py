import requests
import time
import statistics
from concurrent.futures import ThreadPoolExecutor

def test_api_performance():
    url = 'http://localhost:5000/api/quote'
    payload = {
        'job_type': 'HVAC',
        'location': 'CA',
        'complexity': 'medium'
    }

    def make_request():
        start_time = time.time()
        response = requests.post(url, json=payload)
        end_time = time.time()
        return end_time - start_time, response.status_code

    # Test with 100 concurrent requests
    with ThreadPoolExecutor(max_workers=10) as executor:
        results = list(executor.map(lambda x: make_request(), range(100)))

    response_times = [r[0] for r in results]
    status_codes = [r[1] for r in results]

    print("Performance Test Results:")
    print(f"Average Response Time: {statistics.mean(response_times)".3f"}s")
    print(f"Median Response Time: {statistics.median(response_times)".3f"}s")
    print(f"Min Response Time: {min(response_times)".3f"}s")
    print(f"Max Response Time: {max(response_times)".3f"}s")
    print(f"Success Rate: {(status_codes.count(200) / len(status_codes)) * 100".1f"}%")

def test_load():
    print("Starting load test...")
    test_api_performance()

if __name__ == '__main__':
    test_load()
