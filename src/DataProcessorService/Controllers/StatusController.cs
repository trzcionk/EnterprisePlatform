using Microsoft.AspNetCore.Mvc;

namespace DataProcessorService.Controllers
{
    [ApiController]
    [Route("api/status")]
    public class StatusController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetStatus()
        {
            return Ok("Running");
        }
    }
}
